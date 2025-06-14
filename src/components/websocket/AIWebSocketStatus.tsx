import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Shield, ShieldX, Activity, Users } from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';

interface AIWebSocketStatusProps {
  projectId?: string;
  authToken?: string;
  showDetails?: boolean;
}

export function AIWebSocketStatus({ 
  projectId, 
  authToken, 
  showDetails = false 
}: AIWebSocketStatusProps) {
  const {
    isConnected,
    isAuthenticated,
    connectionError,
    isProcessing,
    connect,
    disconnect,
    sendAIRequest,
    scanManifest,
    generateCode
  } = useAIWebSocket({ 
    projectId, 
    authToken, 
    autoConnect: true 
  });

  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        label: 'Disconnected',
        variant: 'destructive' as const,
        color: 'text-red-500'
      };
    }
    
    if (!isAuthenticated) {
      return {
        icon: ShieldX,
        label: 'Not Authenticated',
        variant: 'secondary' as const,
        color: 'text-yellow-500'
      };
    }

    return {
      icon: Wifi,
      label: 'Connected',
      variant: 'default' as const,
      color: 'text-green-500'
    };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        <Badge variant={status.variant}>{status.label}</Badge>
        {isProcessing && (
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          AI WebSocket Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          
          {projectId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project:</span>
              <Badge variant="outline">{projectId}</Badge>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Activity className="h-4 w-4 animate-pulse" />
              Processing AI request...
            </div>
          )}
        </div>

        {/* Error Display */}
        {connectionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{connectionError}</p>
          </div>
        )}

        {/* Connection Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={connect} 
              size="sm" 
              className="flex-1"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Connect
            </Button>
          ) : (
            <Button 
              onClick={disconnect} 
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        {isConnected && isAuthenticated && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions:</h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => sendAIRequest('Generate a simple React component')}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                Test AI Request
              </Button>
              <Button
                onClick={() => scanManifest()}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                Scan Button Manifest
              </Button>
              <Button
                onClick={() => generateCode('Create a login form', 'react')}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                Test Code Generation
              </Button>
            </div>
          </div>
        )}

        {/* Collaboration Indicator */}
        {isConnected && isAuthenticated && projectId && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            Live collaboration enabled
          </div>
        )}
      </CardContent>
    </Card>
  );
}