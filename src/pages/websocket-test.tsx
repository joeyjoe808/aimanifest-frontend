import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Send, 
  Trash2, 
  Wifi, 
  WifiOff,
  Terminal,
  Zap
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function WebSocketTest() {
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io('wss://ai-manifest-ws.fly.dev', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('✅ Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      addLog('❌ Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      addLog(`❌ Connection error: ${error.message}`);
      setIsConnected(false);
    });

    // Listen to all events
    socket.onAny((event, data) => {
      addLog(`📩 Received (${event}): ${JSON.stringify(data)}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    addLog(`📤 Sending: ${message}`);
    socketRef.current.emit('test:event', { message });
    setMessage('');
  };

  const sendTestEvents = () => {
    if (!socketRef.current) return;

    const testEvents = [
      { event: 'ai:request', data: { query: 'Generate a React component' } },
      { event: 'manifest:scan', data: { projectId: 'test-project' } },
      { event: 'code:generate', data: { prompt: 'Create a login form' } }
    ];

    testEvents.forEach((test, index) => {
      setTimeout(() => {
        addLog(`📤 Test ${index + 1}: ${test.event}`);
        socketRef.current?.emit(test.event, test.data);
      }, index * 1000);
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              AIManifest WebSocket Test Interface
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Server: <span className="font-mono">wss://ai-manifest-ws.fly.dev</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Protocol: Socket.IO with WebSocket transport
            </p>
          </div>

          {/* Quick Test Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={sendTestEvents}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              <Zap className="h-3 w-3 mr-1" />
              Run Test Suite
            </Button>
            <Button
              onClick={() => socketRef.current?.emit('ping', { timestamp: Date.now() })}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Send Ping
            </Button>
            <Button
              onClick={() => socketRef.current?.emit('echo', { message: 'Hello Server!' })}
              disabled={!isConnected}
              variant="outline"
              size="sm"
            >
              Send Echo
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message to send..."
              disabled={!isConnected}
            />
            <Button
              onClick={sendMessage}
              disabled={!isConnected || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Log Output */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Communication Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div ref={logRef} className="space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No messages yet. Send a message to test the connection.
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-sm font-mono">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}