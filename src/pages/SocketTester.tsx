import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';

export default function SocketTester() {
  const [eventName, setEventName] = useState('');
  const [eventData, setEventData] = useState('{}');
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isValidJson, setIsValidJson] = useState(true);
  const logsRef = useRef<HTMLDivElement>(null);

  const { 
    isConnected, 
    connectionError, 
    connect, 
    disconnect, 
    socket 
  } = useAIWebSocket({
    autoConnect: true
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (socket) {
      // Listen for all events using onAny
      socket.onAny((eventName, data) => {
        addLog(`📩 Received [${eventName}]: ${JSON.stringify(data || {})}`);
      });

      socket.on('connect', () => {
        addLog('✅ Connected to AI Manifest WebSocket server');
      });

      socket.on('disconnect', () => {
        addLog('❌ Disconnected from WebSocket server');
      });

      socket.on('connect_error', (error: any) => {
        addLog(`🚨 Connection error: ${error.message || 'Unknown error'}`);
      });

      // AI Manifest specific events
      socket.on('manifest:processing', (data) => {
        addLog(`🚀 Manifest processing started: ${data.manifest?.length || 0} items`);
      });

      socket.on('manifest:completed', (data) => {
        addLog(`✅ Manifest processing completed: ${data.success ? 'Success' : 'Failed'}`);
      });

      socket.on('manifest:error', (data) => {
        addLog(`🚨 Manifest processing error: ${data.error}`);
      });

      socket.on('ai:response', (data) => {
        addLog(`🤖 AI Response: ${data.message || 'Processing complete'}`);
      });

      socket.on('code:generated', (data) => {
        addLog(`💻 Code generated: ${data.fileName || 'Unknown file'} (${data.language || 'Unknown language'})`);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [testLogs]);

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleDataChange = (value: string) => {
    setEventData(value);
    validateJson(value);
  };

  const sendEvent = () => {
    if (!socket || !isConnected) {
      addLog('🚨 Error: Socket not connected');
      return;
    }

    if (!eventName.trim()) {
      addLog('🚨 Error: Event name is required');
      return;
    }

    if (!isValidJson) {
      addLog('🚨 Error: Invalid JSON data');
      return;
    }

    try {
      const data = JSON.parse(eventData);
      socket.emit(eventName, data);
      addLog(`📤 Sent [${eventName}]: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addLog(`🚨 Error sending event: ${error.message || 'Unknown error'}`);
    }
  };

  const sendTestManifest = () => {
    const testManifest = [
      {
        id: 'test-button-1',
        label: 'Save Document',
        action: 'save',
        description: 'Save the current document to storage',
        data: {
          endpoint: '/api/documents/save',
          method: 'POST'
        }
      },
      {
        id: 'test-button-2',
        label: 'Load Data',
        action: 'load',
        description: 'Load data from external API',
        data: {
          endpoint: '/api/data/load',
          method: 'GET'
        }
      }
    ];

    if (socket && isConnected) {
      socket.emit('manifest:process', {
        manifest: testManifest,
        projectId: 'test-project',
        userId: 'test-user'
      });
      addLog(`📤 Sent test manifest with ${testManifest.length} items`);
    }
  };

  const sendAIRequest = () => {
    if (socket && isConnected) {
      socket.emit('ai:request', {
        prompt: 'Generate a React component with a button that calls an API',
        agentType: 'frontend',
        context: { framework: 'React', language: 'TypeScript' }
      });
      addLog('📤 Sent AI code generation request');
    }
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Manifest WebSocket Tester</h1>
          <p className="text-muted-foreground">Test WebSocket connections and AI manifest processing</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {!isConnected && (
            <Button onClick={connect} variant="outline" size="sm">
              Connect
            </Button>
          )}
          {isConnected && (
            <Button onClick={disconnect} variant="outline" size="sm">
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {connectionError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">Connection Error: {connectionError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Custom Event Sender</CardTitle>
            <CardDescription>Send custom events to the WebSocket server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., manifest:process"
              />
            </div>
            <div>
              <Label htmlFor="event-data">Event Data (JSON)</Label>
              <Textarea
                id="event-data"
                value={eventData}
                onChange={(e) => handleDataChange(e.target.value)}
                placeholder='{"key": "value"}'
                className={!isValidJson ? "border-destructive" : ""}
                rows={4}
              />
              {!isValidJson && (
                <p className="text-sm text-destructive mt-1">Invalid JSON format</p>
              )}
            </div>
            <Button 
              onClick={sendEvent} 
              disabled={!isConnected || !eventName || !isValidJson}
              className="w-full"
            >
              Send Event
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
            <CardDescription>Pre-configured test scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={sendTestManifest} 
              disabled={!isConnected}
              variant="outline"
              className="w-full"
            >
              Test Manifest Processing
            </Button>
            <Button 
              onClick={sendAIRequest} 
              disabled={!isConnected}
              variant="outline"
              className="w-full"
            >
              Test AI Code Generation
            </Button>
            <Button 
              onClick={() => {
                if (socket && isConnected) {
                  socket.emit('ping', { timestamp: Date.now() });
                  addLog('📤 Sent ping test');
                }
              }} 
              disabled={!isConnected}
              variant="outline"
              className="w-full"
            >
              Send Ping Test
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Logs</CardTitle>
            <CardDescription>Real-time WebSocket event monitoring</CardDescription>
          </div>
          <Button onClick={clearLogs} variant="outline" size="sm">
            Clear Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div 
            ref={logsRef}
            className="bg-muted p-4 rounded-md h-96 overflow-y-auto font-mono text-sm"
          >
            {testLogs.length === 0 ? (
              <p className="text-muted-foreground">No events logged yet. Connect to start monitoring.</p>
            ) : (
              testLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>WebSocket URL</Label>
              <p className="font-mono">wss://ai-manifest-ws.fly.dev/</p>
            </div>
            <div>
              <Label>Connection Status</Label>
              <p className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
            <div>
              <Label>Transport</Label>
              <p>WebSocket, Polling</p>
            </div>
            <div>
              <Label>Reconnection</Label>
              <p>Enabled (10 attempts)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}