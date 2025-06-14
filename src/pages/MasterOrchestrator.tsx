import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Copy, Play, Settings, Code, Database, Globe, Shield, TestTube, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ButtonManifest {
  id: string;
  label: string;
  action: string;
  data?: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  };
  realtime?: boolean;
  socketEvent?: string;
  validation?: Record<string, string>;
  errorHandling?: boolean;
  loadingStates?: boolean;
  description?: string;
}

interface OrchestrationPlan {
  taskId: string;
  phases: Array<{
    id: string;
    type: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    priority: string;
    dependencies: string[];
    agent: string;
    estimatedTime: string;
  }>;
  parallelGroups: string[][];
  qualityGates: Array<{
    checkpoint: string;
    criteria: string[];
    requiredApprovals: string[];
  }>;
}

interface GenerationResult {
  taskId: string;
  phase: string;
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
  nextSteps: string[];
}

export default function MasterOrchestrator() {
  const { toast } = useToast();
  const [manifests, setManifests] = useState<ButtonManifest[]>([]);
  const [requirements, setRequirements] = useState({
    framework: 'express',
    database: 'postgresql',
    authentication: false,
    websockets: false,
    testing: true,
    deployment: true
  });
  const [orchestrationPlan, setOrchestrationPlan] = useState<OrchestrationPlan | null>(null);
  const [executionResults, setExecutionResults] = useState<GenerationResult[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    currentPhase: null as string | null
  });

  // Sample manifests for demonstration
  const sampleManifests: ButtonManifest[] = [
    {
      id: "submitForm",
      label: "Submit",
      action: "submitForm",
      data: {
        endpoint: "/api/form/submit",
        method: "POST"
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
        method: "POST"
      },
      errorHandling: true,
      loadingStates: true,
      description: "Export data to CSV format"
    }
  ];

  const createPlanMutation = useMutation({
    mutationFn: async (data: { manifests: ButtonManifest[]; requirements: any }) => {
      return apiRequest('POST', '/api/orchestrator/create-plan', data);
    },
    onSuccess: (data: any) => {
      setOrchestrationPlan(data.data);
      setActiveTaskId(data.data.taskId);
      toast({
        title: "Orchestration Plan Created",
        description: `Created plan with ${data.data.phases.length} phases`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Plan Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executePlanMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest('POST', `/api/orchestrator/execute/${taskId}`);
    },
    onSuccess: (data: any) => {
      setExecutionResults(data.data);
      toast({
        title: "Orchestration Complete",
        description: `Generated ${data.data.length} code artifacts`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateSmartButtonsMutation = useMutation({
    mutationFn: async (manifests: ButtonManifest[]) => {
      return apiRequest('POST', '/api/generate-smart-buttons', { manifests });
    },
    onSuccess: (data: any) => {
      toast({
        title: "SmartButton Prompt Generated",
        description: `Ready for Claude with ${data.data.estimatedTokens} tokens`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Prompt Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateBackendPromptMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/generate-backend-routes-prompt', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Backend Routes Prompt Generated",
        description: `Ready for ${data.data.framework} with ${data.data.estimatedTokens} tokens`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Prompt Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePlan = () => {
    if (manifests.length === 0) {
      toast({
        title: "No Manifests",
        description: "Please add button manifests before creating a plan",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate({ manifests, requirements });
  };

  const handleExecutePlan = () => {
    if (!activeTaskId) {
      toast({
        title: "No Active Plan",
        description: "Please create an orchestration plan first",
        variant: "destructive",
      });
      return;
    }
    executePlanMutation.mutate(activeTaskId);
  };

  const handleLoadSample = () => {
    setManifests(sampleManifests);
    toast({
      title: "Sample Loaded",
      description: `Loaded ${sampleManifests.length} sample manifests`,
    });
  };

  const addManifest = () => {
    const newManifest: ButtonManifest = {
      id: `button_${Date.now()}`,
      label: "New Button",
      action: "newAction",
      data: {
        endpoint: "/api/new-action",
        method: "POST"
      },
      errorHandling: true,
      loadingStates: true,
      description: "New button description"
    };
    setManifests([...manifests, newManifest]);
  };

  const removeManifest = (index: number) => {
    setManifests(manifests.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Master AI Orchestrator</h1>
        <p className="text-muted-foreground">
          Coordinate specialized AI agents to auto-generate complete full-stack applications from button manifests
        </p>
      </div>

      <Tabs defaultValue="manifests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="manifests">Button Manifests</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
          <TabsTrigger value="prompts">Claude Prompts</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="manifests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Button Manifests Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleLoadSample} variant="outline">
                  Load Sample Manifests
                </Button>
                <Button onClick={addManifest} variant="outline">
                  Add New Manifest
                </Button>
              </div>

              {manifests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Current Manifests ({manifests.length})</h3>
                  {manifests.map((manifest, index) => (
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
                          <Button 
                            onClick={() => removeManifest(index)}
                            variant="ghost" 
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="framework">Backend Framework</Label>
                    <Select value={requirements.framework} onValueChange={(value) => 
                      setRequirements(prev => ({ ...prev, framework: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express">Express.js</SelectItem>
                        <SelectItem value="fastify">Fastify</SelectItem>
                        <SelectItem value="koa">Koa.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="database">Database</Label>
                    <Select value={requirements.database} onValueChange={(value) => 
                      setRequirements(prev => ({ ...prev, database: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Include authentication middleware
                      </p>
                    </div>
                    <Switch
                      checked={requirements.authentication}
                      onCheckedChange={(checked) => 
                        setRequirements(prev => ({ ...prev, authentication: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>WebSocket Support</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable real-time communication
                      </p>
                    </div>
                    <Switch
                      checked={requirements.websockets}
                      onCheckedChange={(checked) => 
                        setRequirements(prev => ({ ...prev, websockets: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Integration Tests</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate test suites
                      </p>
                    </div>
                    <Switch
                      checked={requirements.testing}
                      onCheckedChange={(checked) => 
                        setRequirements(prev => ({ ...prev, testing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deployment Config</Label>
                      <p className="text-sm text-muted-foreground">
                        Include Docker and CI/CD
                      </p>
                    </div>
                    <Switch
                      checked={requirements.deployment}
                      onCheckedChange={(checked) => 
                        setRequirements(prev => ({ ...prev, deployment: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Agent Orchestration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button 
                  onClick={handleCreatePlan}
                  disabled={createPlanMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {createPlanMutation.isPending ? 'Creating Plan...' : 'Create Orchestration Plan'}
                </Button>
                
                {orchestrationPlan && (
                  <Button 
                    onClick={handleExecutePlan}
                    disabled={executePlanMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {executePlanMutation.isPending ? 'Executing...' : 'Execute Plan'}
                  </Button>
                )}
              </div>

              {orchestrationPlan && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">Task ID: {orchestrationPlan.taskId}</Badge>
                    <Badge>{orchestrationPlan.phases.length} Phases</Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Execution Phases</h4>
                    {orchestrationPlan.phases.map((phase, index) => (
                      <Card key={phase.id} className={`border ${
                        phase.status === 'completed' ? 'border-green-500' :
                        phase.status === 'in-progress' ? 'border-blue-500' :
                        phase.status === 'failed' ? 'border-red-500' :
                        'border-gray-200'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  phase.status === 'completed' ? 'default' :
                                  phase.status === 'in-progress' ? 'secondary' :
                                  phase.status === 'failed' ? 'destructive' :
                                  'outline'
                                }>
                                  {phase.status}
                                </Badge>
                                <span className="font-medium">{phase.type}</span>
                                <Badge variant="outline">{phase.agent}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Priority: {phase.priority} • Estimated: {phase.estimatedTime}
                              </p>
                              {phase.dependencies.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Dependencies: {phase.dependencies.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  SmartButton Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate React TypeScript components with real-time feedback, loading states, and WebSocket integration.
                </p>
                <Button 
                  onClick={() => generateSmartButtonsMutation.mutate(manifests)}
                  disabled={generateSmartButtonsMutation.isPending || manifests.length === 0}
                  className="w-full"
                >
                  {generateSmartButtonsMutation.isPending ? 'Generating...' : 'Generate SmartButton Prompt'}
                </Button>
                {generateSmartButtonsMutation.data && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {generateSmartButtonsMutation.data.data.estimatedTokens} tokens
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          generateSmartButtonsMutation.data.data.prompt,
                          'SmartButton prompt copied'
                        )}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Prompt
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-40">
                      <pre>{generateSmartButtonsMutation.data.data.prompt.substring(0, 500)}...</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backend Routes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate production-ready Express.js routes with authentication, validation, and error handling.
                </p>
                <Button 
                  onClick={() => generateBackendPromptMutation.mutate({
                    manifests,
                    framework: requirements.framework,
                    database: requirements.database,
                    authentication: requirements.authentication,
                    websockets: requirements.websockets
                  })}
                  disabled={generateBackendPromptMutation.isPending || manifests.length === 0}
                  className="w-full"
                >
                  {generateBackendPromptMutation.isPending ? 'Generating...' : 'Generate Backend Routes Prompt'}
                </Button>
                {generateBackendPromptMutation.data && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {generateBackendPromptMutation.data.data.estimatedTokens} tokens
                      </Badge>
                      <Badge variant="outline">
                        {generateBackendPromptMutation.data.data.framework}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          generateBackendPromptMutation.data.data.prompt,
                          'Backend routes prompt copied'
                        )}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Prompt
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-40">
                      <pre>{generateBackendPromptMutation.data.data.prompt.substring(0, 500)}...</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Generation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {executionResults.length > 0 ? (
                <div className="space-y-4">
                  {executionResults.map((result, index) => (
                    <Card key={`${result.taskId}-${result.phase}`} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.phase}
                            </Badge>
                            <Badge variant="outline">
                              Quality: {result.metadata.qualityScore}%
                            </Badge>
                          </div>
                          <Badge variant="secondary">
                            {result.metadata.tokenUsage} tokens
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {result.documentation}
                        </p>
                        <div className="space-y-2">
                          <h5 className="font-medium">Generated Files:</h5>
                          {result.generatedCode.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <span className="text-sm font-mono">{file.filename}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {file.language}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(file.content, `${file.filename} copied`)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {result.nextSteps.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-1">Next Steps:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {result.nextSteps.map((step, stepIndex) => (
                                <li key={stepIndex}>• {step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No generation results yet. Create and execute an orchestration plan to see results.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}