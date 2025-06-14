import React from 'react';
import { WebSocketConsole } from './WebSocketConsole';
import { AIWebSocketStatus } from '@/components/websocket/AIWebSocketStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface WebSocketTabProps {
  projectId?: string;
  authToken?: string;
}

export function WebSocketTab({ projectId, authToken }: WebSocketTabProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Real-Time AI Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AIWebSocketStatus 
            projectId={projectId}
            authToken={authToken}
            showDetails={true}
          />
        </CardContent>
      </Card>

      {/* WebSocket Console */}
      <div className="flex-1">
        <WebSocketConsole 
          projectId={projectId}
          authToken={authToken}
        />
      </div>
    </div>
  );
}