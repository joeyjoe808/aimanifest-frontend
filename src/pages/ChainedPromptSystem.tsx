import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertCircle, ArrowRight, Code, Database, Zap, GitBranch, Copy } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChainedPromptResult {
  backendRoutes: {
    success: boolean;
    generatedCode: Array<{
      filename: string;
      content: string;
      language: string;
    }>;
    documentation: string;
    metadata: {
      tokenUsage: number;
      executionTime: number;
      qualityScore: number;
    };
  };
  frontendComponents: {
    success: boolean;
    generatedCode: Array<{
      filename: string;
      content: string;
      language: string;
    }>;
    documentation: string;
    metadata: {
      tokenUsage: number;
      executionTime: number;
      qualityScore: number;
    };
  };
  orchestrationStatus: string;
}

export default function ChainedPromptSystem() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepResults, setStepResults] = useState<ChainedPromptResult | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Sample manifests for demonstration
  const sampleManifests = [
    {
      id: "submitForm",
      label: "Submit",
      action: "submitForm",
      data: {
        endpoint: "/api/form/submit",
        method: "POST" as const
      },
      errorHandling: true,
      loadingStates: true,
      description: "Submit form data to the server"
    },
    {
      id: "startLiveStream",
      label: "Go Live",
      action: "startLiveStream",
      realtime: true,
      socketEvent: "live:start",
      errorHandling: true,
      loadingStates: true,
      description: "Start live streaming with real-time feedback"
    },
    {
      id: "exportData",
      label: "Export CSV",
      action: "exportData",
      data: {
        endpoint: "/api/export/csv",
        method: "POST" as const
      },
      errorHandling: true,
      loadingStates: true,
      description: "Export data to CSV format"
    }
  ];

  const executeMutation = useMutation({
    mutationFn: async (manifests: typeof sampleManifests) => {
      return apiRequest('POST', '/api/orchestrator/chained-prompt-system', { manifests });
    },
    onSuccess: (data: any) => {
      setStepResults(data.data);
      setCurrentStep(4);
      addLogEntry("✅ Chained prompt system completed successfully");
      
      toast({
        title: "Chained Prompt System Complete",
        description: "Backend routes and frontend components generated successfully",
      });
    },
    onError: (error: any) => {
      addLogEntry(`❌ Execution failed: ${error.message}`);
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const directCycleMutation = useMutation({
    mutationFn: async (manifests: typeof sampleManifests) => {
      return apiRequest('POST', '/api/orchestrator/button-manifest-cycle', { manifests });
    },
    onSuccess: (data: any) => {
      addLogEntry("✅ Mega-prompt cycle completed successfully");
      addLogEntry(`📝 Files saved: routes.ts, SmartButton.tsx`);
      addLogEntry(`🚀 Commit hash: ${data.data.commitHash}`);
      addLogEntry(`✨ Validation: ${data.data.validation}`);
      
      toast({
        title: "Mega-Prompt Cycle Complete",
        description: "Code generated via single Claude call with tool use",
      });
    },
    onError: (error: any) => {
      addLogEntry(`❌ Mega-prompt cycle failed: ${error.message}`);
      toast({
        title: "Mega-Prompt Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const legacyCycleMutation = useMutation({
    mutationFn: async (manifests: typeof sampleManifests) => {
      return apiRequest('POST', '/api/orchestrator/button-manifest-cycle-legacy', { manifests });
    },
    onSuccess: (data: any) => {
      addLogEntry("✅ Legacy cycle completed successfully");
      addLogEntry(`📝 Files saved: routes.ts, SmartButton.tsx`);
      addLogEntry(`🚀 Commit hash: ${data.data.commitHash}`);
      
      toast({
        title: "Legacy Cycle Complete",
        description: "Code generated via separate Claude calls",
      });
    },
    onError: (error: any) => {
      addLogEntry(`❌ Legacy cycle failed: ${error.message}`);
      toast({
        title: "Legacy Cycle Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addLogEntry = (entry: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, `[${timestamp}] ${entry}`]);
  };

  const executeChainedPromptSystem = async () => {
    setCurrentStep(1);
    setExecutionLog([]);
    setStepResults(null);
    
    addLogEntry("🧠 Starting chained prompt system...");
    addLogEntry(`📋 Step 1: Manifest scanning complete - ${sampleManifests.length} buttons found`);
    
    // Simulate step progression
    setTimeout(() => {
      setCurrentStep(2);
      addLogEntry("🔧 Step 2: Generating backend routes via Claude...");
    }, 1000);
    
    setTimeout(() => {
      setCurrentStep(3);
      addLogEntry("⚛️ Step 3: Generating SmartButton components via Claude...");
    }, 3000);
    
    setTimeout(() => {
      addLogEntry("🎯 Step 4: Master orchestration validation and integration...");
      executeMutation.mutate(sampleManifests);
    }, 5000);
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description,
    });
  };

  const steps = [
    {
      number: 1,
      title: "Manifest Scanner",
      description: "Extract all <button> elements from JSX and create structured manifest",
      icon: <Code className="w-5 h-5" />,
      status: currentStep >= 1 ? 'completed' : 'pending'
    },
    {
      number: 2,
      title: "Claude Prompt 1 (Backend Routes)",
      description: "Send manifest to Claude with backend route prompt, receive routes.ts",
      icon: <Database className="w-5 h-5" />,
      status: currentStep >= 2 ? (currentStep === 2 ? 'in-progress' : 'completed') : 'pending'
    },
    {
      number: 3,
      title: "Claude Prompt 2 (SmartButton Generator)",
      description: "Send manifest to Claude with SmartButton prompt, receive components",
      icon: <Zap className="w-5 h-5" />,
      status: currentStep >= 3 ? (currentStep === 3 ? 'in-progress' : 'completed') : 'pending'
    },
    {
      number: 4,
      title: "Master Agent Orchestration",
      description: "Validate responses and merge into repo via Git CLI or API",
      icon: <GitBranch className="w-5 h-5" />,
      status: currentStep >= 4 ? 'completed' : (currentStep === 4 ? 'in-progress' : 'pending')
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chained Prompt System</h1>
        <p className="text-muted-foreground">
          Automated workflow from manifest scanning to full-stack code generation
        </p>
      </div>

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="manifests">Manifests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                High-Level Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      step.status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                      step.status === 'in-progress' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                      'bg-gray-100 border-gray-300 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : step.status === 'in-progress' ? (
                        <Clock className="w-6 h-6 animate-pulse" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Step {step.number}: {step.title}</h3>
                        <Badge variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-400 mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={executeChainedPromptSystem}
                  disabled={executeMutation.isPending || directCycleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {executeMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <GitBranch className="w-4 h-4" />
                  )}
                  {executeMutation.isPending ? 'Executing...' : 'Execute Chained Prompt System'}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => directCycleMutation.mutate(sampleManifests)}
                  disabled={executeMutation.isPending || directCycleMutation.isPending || legacyCycleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {directCycleMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {directCycleMutation.isPending ? 'Running...' : 'Run Mega-Prompt Cycle'}
                </Button>

                <Button 
                  variant="secondary"
                  onClick={() => legacyCycleMutation.mutate(sampleManifests)}
                  disabled={executeMutation.isPending || directCycleMutation.isPending || legacyCycleMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {legacyCycleMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <GitBranch className="w-4 h-4" />
                  )}
                  {legacyCycleMutation.isPending ? 'Running...' : 'Run Legacy Cycle'}
                </Button>
                
                {currentStep > 0 && (
                  <Badge variant="secondary">
                    Step {currentStep}/4
                  </Badge>
                )}
              </div>

              {currentStep > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((currentStep / 4) * 100)}%</span>
                  </div>
                  <Progress value={(currentStep / 4) * 100} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-60 overflow-y-auto">
                {executionLog.length === 0 ? (
                  <p className="text-gray-500">No execution log yet. Start the chained prompt system to see logs.</p>
                ) : (
                  <div className="space-y-1">
                    {executionLog.map((entry, index) => (
                      <div key={index} className="text-sm font-mono">
                        {entry}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manifests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Manifests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  These button manifests will be processed through the chained prompt system:
                </p>
                
                {sampleManifests.map((manifest, index) => (
                  <Card key={manifest.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{manifest.id}</Badge>
                            <span className="font-medium">{manifest.label}</span>
                            {manifest.realtime && (
                              <Badge variant="destructive">Real-time</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {manifest.description}
                          </p>
                          <div className="flex gap-2 text-xs">
                            <span>Action: {manifest.action}</span>
                            {manifest.data && (
                              <span>Endpoint: {manifest.data.endpoint}</span>
                            )}
                            {manifest.socketEvent && (
                              <span>Socket: {manifest.socketEvent}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {JSON.stringify(sampleManifests, null, 2)}
                  </pre>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(sampleManifests, null, 2), 'Manifests copied')}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Manifests JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {stepResults ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Backend Routes Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={stepResults.backendRoutes.success ? "default" : "destructive"}>
                          {stepResults.backendRoutes.success ? "Success" : "Failed"}
                        </Badge>
                        <Badge variant="outline">
                          Quality: {stepResults.backendRoutes.metadata.qualityScore}%
                        </Badge>
                        <Badge variant="secondary">
                          {stepResults.backendRoutes.metadata.tokenUsage} tokens
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {stepResults.backendRoutes.documentation}
                      </p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Generated Files:</h5>
                        {stepResults.backendRoutes.generatedCode.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <span className="text-sm font-mono">{file.filename}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.language}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Frontend Components Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={stepResults.frontendComponents.success ? "default" : "destructive"}>
                          {stepResults.frontendComponents.success ? "Success" : "Failed"}
                        </Badge>
                        <Badge variant="outline">
                          Quality: {stepResults.frontendComponents.metadata.qualityScore}%
                        </Badge>
                        <Badge variant="secondary">
                          {stepResults.frontendComponents.metadata.tokenUsage} tokens
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {stepResults.frontendComponents.documentation}
                      </p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Generated Files:</h5>
                        {stepResults.frontendComponents.generatedCode.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <span className="text-sm font-mono">{file.filename}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.language}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Orchestration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                    <pre className="text-sm whitespace-pre-wrap">
                      {stepResults.orchestrationStatus}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No results yet. Execute the chained prompt system to see generated code.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Backend Integration</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Generated Express.js routes</li>
                      <li>• Database schema updates</li>
                      <li>• WebSocket event handlers</li>
                      <li>• Authentication middleware</li>
                      <li>• Input validation schemas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Frontend Integration</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• SmartButton components</li>
                      <li>• WebSocket integration</li>
                      <li>• State management hooks</li>
                      <li>• Error handling logic</li>
                      <li>• TypeScript interfaces</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Deployment Pipeline</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. Validate generated code syntax and dependencies</p>
                    <p>2. Run automated tests on backend routes and frontend components</p>
                    <p>3. Merge code into repository via Git CLI or API</p>
                    <p>4. Trigger CI/CD pipeline for automated deployment</p>
                    <p>5. Monitor application performance and error rates</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Git Integration Commands</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`git checkout -b feature/chained-prompt-generated-code
git add server/routes/generated-routes.ts
git add client/src/components/GeneratedSmartButtons.tsx
git commit -m "Add AI-generated routes and components"
git push origin feature/chained-prompt-generated-code`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}