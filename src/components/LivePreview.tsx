import React, { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface LivePreviewProps {
  projectId: string;
  code?: string;
  className?: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ 
  projectId, 
  code: initialCode,
  className = ""
}) => {
  const wsUrl = `ws://localhost:5000/ws-live`;
  const { socket, isConnected, lastMessage, sendMessage } = useWebSocket(wsUrl, projectId);
  const [code, setCode] = useState(initialCode || '<h1>Loading AI Manifest...</h1>');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (socket && isConnected) {
      sendMessage({ 
        type: 'code:request', 
        data: { projectId },
        projectId 
      });
    }
  }, [socket, isConnected, projectId, sendMessage]);

  useEffect(() => {
    if (lastMessage?.type === 'code:update') {
      setCode(lastMessage.data.code || lastMessage.data);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (socket && isConnected) {
        sendMessage({
          type: 'code:update',
          data: { code: initialCode, projectId },
          projectId
        });
      }
    }
  }, [initialCode, socket, isConnected, projectId, sendMessage]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white" 
    : `${className}`;

  return (
    <Card className={containerClass}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          title="AI Manifest Live Preview"
          srcDoc={code}
          className="w-full border-0"
          style={{ 
            height: isFullscreen ? 'calc(100vh - 80px)' : '600px',
            backgroundColor: 'white'
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </CardContent>
    </Card>
  );
};

export default LivePreview;