import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Play, FileCode, Database, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ManifestResult {
  scanResult: {
    manifests: any[];
    summary: any;
  };
  generatedFiles: {
    backend: { filename: string; content: string; size: number };
    frontend: { filename: string; content: string; size: number };
  };
  validation: {
    passed: boolean;
    issues: string[];
    score: number;
  };
  deployment: {
    status: string;
    errors: string[];
  };
  metrics: {
    totalTime: number;
    scanTime: number;
    generationTime: number;
    validationTime: number;
    deploymentTime: number;
  };
}

export default function AIManifestEngine() {
  const [sampleCode, setSampleCode] = useState(`// Sample React component with button manifests
function UserDashboard() {
  return (
    <div className="dashboard">
      <button 
        data-manifest='{"label": "Save Data", "description": "Save data via REST API", "data": {"endpoint": "/api/save-data", "method": "POST", "payload": {"data": "any", "metadata": "object"}}, "validation": {"required": ["data"], "optional": ["metadata"]}, "metadata": {"category": "data", "complexity": "medium"}}'
        onClick={() => console.log('Save clicked')}
      >
        Save Data
      </button>
      
      <button 
        data-manifest='{"label": "Export Data", "description": "Export data via REST API", "data": {"endpoint": "/api/export-data", "method": "POST", "payload": {"format": "csv", "filters": "object", "columns": "array"}}, "validation": {"required": ["format"], "optional": ["filters", "columns"]}, "metadata": {"category": "export", "complexity": "high"}}'
        onClick={() => console.log('Export clicked')}
      >
        Export Data
      </button>
      
      <button 
        data-manifest='{"label": "Sync Data", "description": "Sync data via REST API", "data": {"endpoint": "/api/sync-data", "method": "POST", "payload": {"lastSync": "string", "changeSet": "array"}}, "validation": {"required": ["lastSync", "changeSet"], "optional": []}, "metadata": {"category": "sync", "complexity": "medium"}}'
        onClick={() => console.log('Sync clicked')}
      >
        Sync Data
      </button>
      
      <button 
        data-manifest='{"label": "Live Notification", "description": "Real-time notification with WebSocket communication", "realtime": true, "socketEvent": "live_notification", "validation": {"required": ["message"], "optional": ["type"]}, "metadata": {"category": "realtime", "complexity": "high"}}'
        onClick={() => console.log('Notify clicked')}
      >
        Live Notification
      </button>
    </div>
  );
}`);
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ManifestResult | null>(null);
  const { toast } = useToast();

  const executeOrchestration = async () => {
    setIsLoading(true);
    setProgress(0);
    setCurrentStep('Scanning manifests...');
    
    try {
      // First scan the manifests from the sample code
      const scanResponse = await apiRequest('POST', '/api/scan-component-buttons', {
        content: sampleCode
      });
      
      if (!scanResponse.success || !scanResponse.data.manifests?.length) {
        toast({
          title: "No Manifests Found",
          description: "No button manifests detected in the sample code",
          variant: "destructive",
        });
        return;
      }

      const manifests = scanResponse.data.manifests;
      setProgress(25);
      setCurrentStep('Executing AI Manifest Engine...');

      // Execute the unified manifest processing pipeline
      const orchestrationResponse = await apiRequest('POST', '/api/manifest/process', {
        manifests,
        config: {
          outputPath: './server/ai-manifest-engine/outputs',
          promptOptions: {
            backend: {
              includeAuthentication: true,
              includeValidation: true,
              includeRateLimit: true,
              includeWebSocket: true,
              errorHandling: 'comprehensive',
              outputFormat: 'typescript'
            },
            frontend: {
              framework: 'react',
              styling: 'tailwind',
              stateManagement: 'useState',
              accessibility: true,
              testing: false,
              typescript: true,
              responsiveDesign: true
            }
          },
          integrations: {
            claude: {
              model: 'claude-3-5-sonnet-20241022',
              maxTokens: 4000
            },
            git: {
              enabled: false
            },
            validation: {
              enabled: true,
              strictMode: false
            }
          }
        }
      });

      setProgress(100);
      setCurrentStep('Complete!');

      if (orchestrationResponse.success) {
        setResult(orchestrationResponse.data);
        toast({
          title: "AI Manifest Engine Complete",
          description: `Generated ${orchestrationResponse.data.generatedFiles.backend.filename} and ${orchestrationResponse.data.generatedFiles.frontend.filename}`,
        });
      } else {
        throw new Error(orchestrationResponse.error || 'Orchestration failed');
      }

    } catch (error: any) {
      console.error('Orchestration error:', error);
      toast({
        title: "Orchestration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => `${ms}ms`;
  const formatBytes = (bytes: number) => `${(bytes / 1024).toFixed(1)}KB`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">AI Manifest Engine</h1>
        <p className="text-xl text-muted-foreground">
          Complete automation pipeline from manifest scanning to code deployment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Sample Component Code
          </CardTitle>
          <CardDescription>
            Edit the React component below to test manifest scanning and code generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sampleCode}
            onChange={(e) => setSampleCode(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Enter React component code with data-manifest attributes..."
          />
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Lines: {sampleCode.split('\n').length} | Characters: {sampleCode.length}
            </div>
            <Button 
              onClick={executeOrchestration}
              disabled={isLoading || !sampleCode.trim()}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isLoading ? 'Processing...' : 'Execute Pipeline'}
            </Button>
          </div>

          {isLoading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manifests">Manifests</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Manifests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{result.scanResult.manifests.length}</div>
                  <p className="text-xs text-muted-foreground">Button manifests found</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Generated Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(result.generatedFiles.backend.size + result.generatedFiles.frontend.size)} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {result.validation.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{result.validation.score}/100</div>
                  <p className="text-xs text-muted-foreground">
                    {result.validation.issues.length} issues found
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Total Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(result.metrics.totalTime)}</div>
                  <p className="text-xs text-muted-foreground">End-to-end execution</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Scan Time</div>
                    <div className="text-muted-foreground">{formatTime(result.metrics.scanTime)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Generation Time</div>
                    <div className="text-muted-foreground">{formatTime(result.metrics.generationTime)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Validation Time</div>
                    <div className="text-muted-foreground">{formatTime(result.metrics.validationTime)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Deployment Time</div>
                    <div className="text-muted-foreground">{formatTime(result.metrics.deploymentTime)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manifests">
            <Card>
              <CardHeader>
                <CardTitle>Detected Button Manifests</CardTitle>
                <CardDescription>
                  {result.scanResult.manifests.length} manifests found and analyzed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.scanResult.manifests.map((manifest, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{manifest.label}</h4>
                        <div className="flex gap-2">
                          <Badge variant={manifest.realtime ? "default" : "secondary"}>
                            {manifest.realtime ? "WebSocket" : "REST API"}
                          </Badge>
                          <Badge variant="outline">
                            {manifest.metadata?.complexity || "medium"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{manifest.description}</p>
                      <div className="text-xs space-y-1">
                        {manifest.data?.endpoint && (
                          <div><strong>Endpoint:</strong> {manifest.data.method} {manifest.data.endpoint}</div>
                        )}
                        {manifest.socketEvent && (
                          <div><strong>Socket Event:</strong> {manifest.socketEvent}</div>
                        )}
                        {manifest.validation?.required?.length > 0 && (
                          <div><strong>Required:</strong> {manifest.validation.required.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend">
            <Card>
              <CardHeader>
                <CardTitle>Generated Backend Routes</CardTitle>
                <CardDescription>
                  {result.generatedFiles.backend.filename} ({formatBytes(result.generatedFiles.backend.size)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                  <code>{result.generatedFiles.backend.content}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend">
            <Card>
              <CardHeader>
                <CardTitle>Generated Frontend Components</CardTitle>
                <CardDescription>
                  {result.generatedFiles.frontend.filename} ({formatBytes(result.generatedFiles.frontend.size)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                  <code>{result.generatedFiles.frontend.content}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.validation.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Score: {result.validation.score}/100 | Status: {result.validation.passed ? "Passed" : "Failed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.validation.issues.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Issues Found:</h4>
                    <ul className="space-y-1">
                      {result.validation.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>All validation checks passed!</span>
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Deployment Status</h4>
                  <div className="flex items-center gap-2">
                    {result.deployment.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="capitalize">{result.deployment.status}</span>
                  </div>
                  {result.deployment.errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.deployment.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}