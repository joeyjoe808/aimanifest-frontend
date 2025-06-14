import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Activity,
  Bot,
  Code,
  Search
} from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';
import { AIWebSocketStatus } from '@/components/websocket/AIWebSocketStatus';

interface LogEntry {
  id: string;
  type: 'command' | 'response' | 'error' | 'info';
  content: string;
  timestamp: Date;
  agentType?: string;
}

interface WebSocketConsoleProps {
  projectId?: string;
  authToken?: string;
}

export function WebSocketConsole({ projectId, authToken }: WebSocketConsoleProps) {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isAuthenticated,
    connectionError,
    isProcessing,
    sendAIRequest,
    scanManifest,
    generateCode,
    aiResponse,
    manifestUpdate,
    codeGeneration
  } = useAIWebSocket({ 
    projectId, 
    authToken, 
    autoConnect: true 
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Add log entry
  const addLog = (type: LogEntry['type'], content: string, agentType?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      agentType
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Handle AI responses
  useEffect(() => {
    if (aiResponse) {
      if (aiResponse.success) {
        addLog('response', `AI Response: ${JSON.stringify(aiResponse.result, null, 2)}`, aiResponse.agentType);
      } else {
        addLog('error', `AI Error: ${aiResponse.error}`);
      }
    }
  }, [aiResponse]);

  // Handle manifest updates
  useEffect(() => {
    if (manifestUpdate) {
      addLog('info', `Button Manifest Updated: ${manifestUpdate.totalButtons} buttons found`);
    }
  }, [manifestUpdate]);

  // Handle code generation
  useEffect(() => {
    if (codeGeneration) {
      if (codeGeneration.success) {
        addLog('response', `Code Generated:\n${codeGeneration.code}`, 'code-generator');
      } else {
        addLog('error', `Code Generation Error: ${codeGeneration.error}`);
      }
    }
  }, [codeGeneration]);

  // Handle connection errors
  useEffect(() => {
    if (connectionError) {
      addLog('error', `Connection Error: ${connectionError}`);
    }
  }, [connectionError]);

  const handleSendCommand = () => {
    if (!command.trim() || !isConnected || !isAuthenticated) return;

    addLog('command', command);

    // Parse command type
    if (command.startsWith('/ai ')) {
      const prompt = command.slice(4);
      sendAIRequest(prompt, 'master-agent');
    } else if (command.startsWith('/scan')) {
      scanManifest();
    } else if (command.startsWith('/code ')) {
      const prompt = command.slice(6);
      generateCode(prompt, 'react');
    } else {
      // Default to AI request
      sendAIRequest(command, 'master-agent');
    }

    setCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'command': return <Send className="h-3 w-3" />;
      case 'response': return <Bot className="h-3 w-3" />;
      case 'error': return <Activity className="h-3 w-3 text-red-500" />;
      case 'info': return <Search className="h-3 w-3 text-blue-500" />;
      default: return <Terminal className="h-3 w-3" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'command': return 'text-blue-600';
      case 'response': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-gray-600';
      default: return 'text-gray-800';
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            AI WebSocket Console
          </CardTitle>
          <div className="flex items-center gap-2">
            <AIWebSocketStatus 
              projectId={projectId}
              authToken={authToken}
              showDetails={false}
            />
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Commands */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => setCommand('/ai Generate a React component')}
            variant="outline"
            size="sm"
            disabled={!isConnected || !isAuthenticated}
          >
            <Bot className="h-3 w-3 mr-1" />
            AI
          </Button>
          <Button
            onClick={() => setCommand('/scan')}
            variant="outline"
            size="sm"
            disabled={!isConnected || !isAuthenticated}
          >
            <Search className="h-3 w-3 mr-1" />
            Scan
          </Button>
          <Button
            onClick={() => setCommand('/code Create a login form')}
            variant="outline"
            size="sm"
            disabled={!isConnected || !isAuthenticated}
          >
            <Code className="h-3 w-3 mr-1" />
            Code
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        {/* Log Area */}
        <ScrollArea className="flex-1 h-96 border rounded-md p-3 bg-gray-50">
          <div ref={scrollRef} className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No messages yet. Try sending a command below.
                <br />
                <span className="text-xs">
                  Commands: /ai [prompt], /scan, /code [prompt]
                </span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-sm">
                  <div className="flex items-center gap-1 min-w-0">
                    {getLogIcon(log.type)}
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    {log.agentType && (
                      <Badge variant="outline" className="text-xs">
                        {log.agentType}
                      </Badge>
                    )}
                  </div>
                  <div className={`flex-1 ${getLogColor(log.type)}`}>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                      {log.content}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Command Input */}
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isConnected ? 'Not connected...' :
              !isAuthenticated ? 'Not authenticated...' :
              'Enter command (/ai, /scan, /code) or prompt...'
            }
            disabled={!isConnected || !isAuthenticated || isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendCommand}
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

        {/* Status Info */}
        <div className="text-xs text-gray-500">
          {projectId && `Project: ${projectId} | `}
          WebSocket: {isConnected ? (isAuthenticated ? 'Ready' : 'Connected') : 'Disconnected'}
        </div>
      </CardContent>
    </Card>
  );
}