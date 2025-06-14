import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Bot, 
  Code, 
  Search, 
  Wifi, 
  WifiOff,
  Zap,
  Terminal,
  Play
} from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';

export function LiveWebSocketDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const {
    isConnected,
    isAuthenticated,
    sendAIRequest,
    scanManifest,
    generateCode,
    aiResponse,
    manifestUpdate,
    codeGeneration
  } = useAIWebSocket({ 
    projectId: 'demo-project', 
    authToken: 'demo-token',
    autoConnect: true 
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (aiResponse) {
      addLog(aiResponse.success 
        ? `✅ AI Response: ${JSON.stringify(aiResponse.result).slice(0, 100)}...`
        : `❌ AI Error: ${aiResponse.error}`
      );
    }
  }, [aiResponse]);

  useEffect(() => {
    if (manifestUpdate) {
      addLog(`✅ Button Manifest: Found ${manifestUpdate.totalButtons} buttons`);
    }
  }, [manifestUpdate]);

  useEffect(() => {
    if (codeGeneration) {
      addLog(codeGeneration.success
        ? `✅ Code Generated: ${codeGeneration.language} - ${codeGeneration.fileName}`
        : `❌ Code Error: ${codeGeneration.error}`
      );
    }
  }, [codeGeneration]);

  const demoSteps = [
    {
      title: "AI Agent Request",
      action: () => sendAIRequest('Generate a simple React button component', 'master-agent'),
      description: "Send request to Master AI Agent"
    },
    {
      title: "Button Manifest Scan", 
      action: () => scanManifest(),
      description: "Scan components for buttons"
    },
    {
      title: "Code Generation",
      action: () => generateCode('Create a responsive navbar component', 'react'),
      description: "Generate React component code"
    }
  ];

  const runDemo = async () => {
    if (!isConnected || !isAuthenticated) {
      addLog('❌ Please wait for WebSocket connection and authentication');
      return;
    }

    setIsRunning(true);
    addLog('🚀 Starting WebSocket Demo...');

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i);
      const step = demoSteps[i];
      
      addLog(`⏳ Step ${i + 1}: ${step.title} - ${step.description}`);
      step.action();
      
      // Wait before next step
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setIsRunning(false);
    setCurrentStep(0);
    addLog('✅ Demo completed!');
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            WebSocket Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Bot className={`h-4 w-4 ${isAuthenticated ? 'text-blue-500' : 'text-gray-400'}`} />
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? 'Authenticated' : 'Not Auth'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Live Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runDemo}
            disabled={!isConnected || !isAuthenticated || isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Running Demo...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start WebSocket Demo
              </>
            )}
          </Button>

          {/* Demo Steps */}
          <div className="space-y-2">
            {demoSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded border ${
                  currentStep === index && isRunning 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === index && isRunning
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {currentStep === index && isRunning && (
                  <Activity className="h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Live Activity Log
            </div>
            <Badge variant="outline">{logs.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Activity log will appear here...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="break-words">
                    {log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {logs.length > 0 && (
            <Button
              onClick={() => setLogs([])}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Clear Log
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={() => sendAIRequest('Hello AI!')}
              disabled={!isConnected || !isAuthenticated}
              variant="outline"
              size="sm"
            >
              <Bot className="h-4 w-4 mr-2" />
              Test AI
            </Button>
            
            <Button
              onClick={() => scanManifest()}
              disabled={!isConnected || !isAuthenticated}
              variant="outline"
              size="sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Scan Buttons
            </Button>
            
            <Button
              onClick={() => generateCode('Simple login form', 'react')}
              disabled={!isConnected || !isAuthenticated}
              variant="outline"
              size="sm"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}