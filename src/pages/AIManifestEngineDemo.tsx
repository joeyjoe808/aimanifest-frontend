import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, Code, Database, Zap } from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';
import { AIWebSocketStatus } from '@/components/websocket/AIWebSocketStatus';

export default function AIManifestEngineDemo() {
  const [manifest, setManifest] = useState(JSON.stringify([
    {
      id: "createUser",
      label: "Create User",
      description: "Create a new user account",
      endpoint: "/api/users",
      method: "POST",
      realtime: false,
      validation: {
        required: ["name", "email"],
        optional: ["phone", "address"]
      }
    },
    {
      id: "sendMessage",
      label: "Send Message",
      description: "Send real-time message",
      socketEvent: "send_message",
      realtime: true,
      validation: {
        required: ["content", "recipientId"]
      }
    },
    {
      id: "exportData",
      label: "Export Data",
      description: "Export user data to CSV",
      endpoint: "/api/users/export",
      method: "GET",
      realtime: false
    }
  ], null, 2));

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isConnected,
    isAuthenticated,
    connectionError,
    sendAIRequest,
    aiResponse
  } = useAIWebSocket({ 
    projectId: "ai-manifest-demo",
    autoConnect: true 
  });

  const generateCode = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const parsedManifest = JSON.parse(manifest);
      
      // Send request to AI manifest engine
      const response = await fetch('/api/ai-manifest-engine/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manifest: parsedManifest })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedCode(result.data);
      } else {
        setError(result.error || 'Code generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithTools = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCode(null);

    try {
      const parsedManifest = JSON.parse(manifest);
      
      const response = await fetch('/api/ai-manifest-engine/generate-with-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manifest: parsedManifest })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedCode(result.data);
      } else {
        setError(result.error || 'Tool-based generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code with tools');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendWebSocketRequest = () => {
    if (isConnected && isAuthenticated) {
      sendAIRequest(`Generate code for this manifest: ${manifest}`, 'manifest-agent');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Manifest Engine Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience the power of AI-driven code generation. Transform button manifests into production-ready 
          TypeScript backends and React frontends using Claude AI integration.
        </p>
        
        {/* Connection Status with Environment Info */}
        <div className="flex flex-col items-center space-y-2">
          <AIWebSocketStatus projectId="ai-manifest-demo" showDetails={false} />
          <div className="text-sm text-gray-500 max-w-md text-center">
            {window.location.hostname === 'localhost' ? (
              <span>
                Development mode: Using local WebSocket server. 
                External features available after deployment.
              </span>
            ) : (
              <span>
                Production mode: Connected to distributed WebSocket infrastructure.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Button Manifest Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Manifest JSON (Define buttons and their behavior)
              </label>
              <Textarea
                value={manifest}
                onChange={(e) => setManifest(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Enter your button manifest JSON..."
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={generateCode} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating with Claude AI...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Code (Standard)
                  </>
                )}
              </Button>

              <Button 
                onClick={generateWithTools} 
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating with Tools...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Generate with AI Tools
                  </>
                )}
              </Button>

              {isConnected && isAuthenticated && (
                <Button 
                  onClick={sendWebSocketRequest}
                  variant="secondary"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate via WebSocket
                </Button>
              )}
            </div>

            {connectionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{connectionError}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Generated Code Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {generatedCode ? (
              <Tabs defaultValue="backend" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="backend">Backend Routes</TabsTrigger>
                  <TabsTrigger value="frontend">Frontend Components</TabsTrigger>
                </TabsList>
                
                <TabsContent value="backend" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">Express.js</Badge>
                      <span className="text-sm text-gray-500">
                        {generatedCode.backend?.size || 'N/A'} characters
                      </span>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      <code>{generatedCode.backend?.content || 'No backend code generated'}</code>
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="frontend" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <span className="text-sm text-gray-500">
                        {generatedCode.frontend?.size || 'N/A'} characters
                      </span>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                      <code>{generatedCode.frontend?.content || 'No frontend code generated'}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generated code will appear here</p>
                <p className="text-sm">Click "Generate Code" to start AI code generation</p>
              </div>
            )}

            {aiResponse && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-700">WebSocket Response:</p>
                <pre className="text-xs text-blue-600 mt-1">
                  {JSON.stringify(aiResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deployment Architecture Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="h-5 w-5" />
            WebSocket Architecture & Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Local Development</h4>
              <ul className="text-sm space-y-1">
                <li>• Uses local WebSocket server (ws://localhost:5000)</li>
                <li>• AI code generation fully functional</li>
                <li>• External WebSocket connection expected to fail</li>
                <li>• Real-time features work within local session</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Production Deployment</h4>
              <ul className="text-sm space-y-1">
                <li>• Connects to external server (wss://ai-manifest-ws.fly.dev)</li>
                <li>• Full distributed WebSocket infrastructure</li>
                <li>• Multi-user real-time collaboration</li>
                <li>• Cross-deployment synchronization</li>
              </ul>
            </div>
          </div>
          <div className="p-3 bg-blue-100 rounded-md">
            <p className="text-sm">
              <strong>Note:</strong> WebSocket connection errors during local development are expected and normal. 
              The AI Manifest Engine core functionality (code generation) operates through HTTP endpoints and works in all environments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Manifest Engine Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Claude AI Integration</h3>
              <p className="text-sm text-gray-600">
                Real AI code generation using Anthropic's Claude 3.5 Sonnet
              </p>
            </div>
            <div className="text-center p-4">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Smart Tool Usage</h3>
              <p className="text-sm text-gray-600">
                AI-powered tools for structured code generation and validation
              </p>
            </div>
            <div className="text-center p-4">
              <Code className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Multi-Agent System</h3>
              <p className="text-sm text-gray-600">
                Coordinated agents for backend, frontend, and live preview generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}