import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Send, 
  Bot, 
  Code, 
  Search, 
  Wifi, 
  WifiOff,
  Zap,
  Users,
  Terminal
} from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';
import { AIWebSocketStatus } from '@/components/websocket/AIWebSocketStatus';
import { LiveWebSocketDemo } from '@/components/demo/LiveWebSocketDemo';

export default function WebSocketDemo() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<Array<{
    id: string;
    type: 'sent' | 'received' | 'info' | 'error';
    content: string;
    timestamp: Date;
    agent?: string;
  }>>([]);

  const {
    isConnected,
    isAuthenticated,
    connectionError,
    isProcessing,
    connect,
    disconnect,
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

  // Add log entry
  const addLog = (type: typeof logs[0]['type'], content: string, agent?: string) => {
    setLogs(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      agent
    }]);
  };

  // Handle responses
  useEffect(() => {
    if (aiResponse) {
      addLog('received', 
        aiResponse.success 
          ? `AI Response: ${JSON.stringify(aiResponse.result, null, 2)}`
          : `AI Error: ${aiResponse.error}`,
        aiResponse.agentType
      );
    }
  }, [aiResponse]);

  useEffect(() => {
    if (manifestUpdate) {
      addLog('info', `Button Manifest: Found ${manifestUpdate.totalButtons} buttons`);
    }
  }, [manifestUpdate]);

  useEffect(() => {
    if (codeGeneration) {
      addLog('received',
        codeGeneration.success
          ? `Generated ${codeGeneration.language} code:\n${codeGeneration.code}`
          : `Code Error: ${codeGeneration.error}`,
        'code-generator'
      );
    }
  }, [codeGeneration]);

  useEffect(() => {
    if (connectionError) {
      addLog('error', `Connection Error: ${connectionError}`);
    }
  }, [connectionError]);

  const handleSend = () => {
    if (!command.trim()) return;
    
    addLog('sent', command);
    
    if (command.startsWith('/ai ')) {
      sendAIRequest(command.slice(4), 'master-agent');
    } else if (command === '/scan') {
      scanManifest();
    } else if (command.startsWith('/code ')) {
      generateCode(command.slice(6), 'react');
    } else {
      sendAIRequest(command, 'master-agent');
    }
    
    setCommand('');
  };

  const demoCommands = [
    { cmd: '/ai Generate a React component for user profile', desc: 'AI Code Generation' },
    { cmd: '/scan', desc: 'Scan Button Manifest' },
    { cmd: '/code Create a responsive navbar', desc: 'Code Generator' },
    { cmd: 'Help me build a dashboard', desc: 'General AI Request' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI Manifest WebSocket Demo
          </h1>
          <p className="text-xl text-gray-600">
            Real-time AI communication with multi-agent coordination
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="text-sm text-gray-500">WebSocket Status</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Bot className={`h-5 w-5 ${isAuthenticated ? 'text-blue-500' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium">
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </div>
                  <div className="text-sm text-gray-500">AI Agent Access</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${isProcessing ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium">
                    {isProcessing ? 'Processing' : 'Ready'}
                  </div>
                  <div className="text-sm text-gray-500">AI Request Status</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              {!isConnected ? (
                <Button onClick={connect} size="sm">
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              ) : (
                <Button onClick={disconnect} variant="outline" size="sm">
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Demo Component */}
        <LiveWebSocketDemo />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Command Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                AI Command Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Demo Commands */}
              <div>
                <h4 className="font-medium mb-2">Try these demo commands:</h4>
                <div className="space-y-2">
                  {demoCommands.map((demo, i) => (
                    <Button
                      key={i}
                      onClick={() => setCommand(demo.cmd)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left"
                      disabled={!isConnected || !isAuthenticated}
                    >
                      <Code className="h-3 w-3 mr-2" />
                      <div className="flex-1">
                        <div className="font-mono text-xs">{demo.cmd}</div>
                        <div className="text-xs text-gray-500">{demo.desc}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Command Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter AI command or /ai, /scan, /code..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!isConnected || !isAuthenticated || isProcessing}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!command.trim() || !isConnected || !isAuthenticated || isProcessing}
                    size="sm"
                  >
                    {isProcessing ? (
                      <Activity className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  Commands: /ai [prompt], /scan, /code [prompt], or plain text for AI
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Communication Log
                </div>
                <Badge variant="outline">{logs.length} messages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto space-y-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    WebSocket communication log will appear here...
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-gray-500 text-xs min-w-0">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`
                        ${log.type === 'sent' ? 'text-blue-400' : ''}
                        ${log.type === 'received' ? 'text-green-400' : ''}
                        ${log.type === 'info' ? 'text-yellow-400' : ''}
                        ${log.type === 'error' ? 'text-red-400' : ''}
                      `}>
                        [{log.type.toUpperCase()}]
                      </span>
                      {log.agent && (
                        <Badge variant="outline" className="text-xs">
                          {log.agent}
                        </Badge>
                      )}
                      <pre className="flex-1 whitespace-pre-wrap break-words">
                        {log.content}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">AI Agent Communication</h4>
                  <p className="text-sm text-gray-600">
                    Real-time requests to Master AI Agent with streaming responses
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Live Button Scanning</h4>
                  <p className="text-sm text-gray-600">
                    Instant component scanning and button manifest updates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Code className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-medium">Code Generation</h4>
                  <p className="text-sm text-gray-600">
                    Streaming code generation with real-time progress updates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-medium">Project Collaboration</h4>
                  <p className="text-sm text-gray-600">
                    Multi-user project rooms with live synchronization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h4 className="font-medium">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">
                    Live preview updates and development synchronization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium">Agent Memory</h4>
                  <p className="text-sm text-gray-600">
                    Context storage and retrieval for intelligent AI responses
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}