import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface LivePreviewProps {
  codePayload?: {
    html: string;
    css?: string;
    js?: string;
  };
  files?: Record<string, string>;
  isVisible?: boolean;
  onToggle?: (visible: boolean) => void;
  className?: string;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', height: '600px' },
  tablet: { width: '768px', height: '600px' },
  mobile: { width: '375px', height: '600px' }
};

const getCurrentProjectId = (): number => {
  const path = window.location.pathname;
  const match = path.match(/\/projects\/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

export const LivePreview: React.FC<LivePreviewProps> = ({ 
  codePayload, 
  files,
  isVisible = true, 
  onToggle,
  className 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const constructDocument = (payload: { html: string; css?: string; js?: string }) => {
    const { html, css = '', js = '' } = payload;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
      line-height: 1.6;
      background: #ffffff;
    }
    * { box-sizing: border-box; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Sandboxed execution environment
    (function() {
      'use strict';
      try {
        ${js}
      } catch (error) {
        console.error('Preview script error:', error);
        document.body.innerHTML += '<div style="padding: 20px; background: #fee; border: 1px solid #fcc; color: #c33; margin-top: 20px;">Script Error: ' + error.message + '</div>';
      }
    })();
  </script>
</body>
</html>`;
  };

  const updatePreview = (payload: { html: string; css?: string; js?: string }) => {
    if (!iframeRef.current || !payload.html) return;
    
    setIsLoading(true);
    
    try {
      const document = constructDocument(payload);
      const blob = new Blob([document], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;
      setLastUpdate(new Date());
      
      // Cleanup blob URL after iframe loads
      iframeRef.current.onload = () => {
        URL.revokeObjectURL(url);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Preview update error:', error);
      setIsLoading(false);
    }
  };

  const refreshPreview = () => {
    if (codePayload) {
      updatePreview(codePayload);
    }
  };

  // Socket.IO connection for live updates
  useEffect(() => {
    if (!isVisible) return;

    const connectSocket = () => {
      try {
        const socket = io("wss://ai-manifest-ws.fly.dev/");
        
        socket.on("connect", () => {
          console.log("LivePreview WebSocket connected");
          setConnectionStatus('connected');
          
          // Subscribe to preview updates for current project
          const currentProjectId = getCurrentProjectId();
          socket.emit("preview_update", {
            type: 'subscribe_preview',
            projectId: currentProjectId
          });
        });
        
        socket.on("preview_update:response", (data) => {
          try {
            console.log("Preview update received:", data);
            refreshPreview();
          } catch (error) {
            console.error('Socket message error:', error);
          }
        });
        
        socket.on("disconnect", () => {
          console.log('LivePreview WebSocket disconnected');
          setConnectionStatus('disconnected');
          socketRef.current = null;
          
          // Clear any existing reconnection timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Socket.IO handles reconnection automatically, but we can add manual retry if needed
          if (isVisible) {
            reconnectTimeoutRef.current = setTimeout(connectSocket, 3000);
          }
        });
        
        socket.on("connect_error", (error) => {
          console.error('LivePreview WebSocket error:', error);
          setConnectionStatus('disconnected');
        });
        
        socketRef.current = socket;
      } catch (error) {
        console.error('Failed to create Socket.IO connection:', error);
        setConnectionStatus('disconnected');
      }
    };

    setConnectionStatus('connecting');
    connectSocket();

    return () => {
      // Clear reconnection timeout to prevent memory leaks
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close Socket.IO connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isVisible]);

  // Update preview when codePayload or files change
  useEffect(() => {
    if (isVisible) {
      if (files && files['index.html']) {
        // Handle files prop by creating codePayload structure
        const payload = {
          html: files['index.html'],
          css: files['style.css'] || files['styles.css'] || '',
          js: files['script.js'] || files['main.js'] || ''
        };
        updatePreview(payload);
      } else if (codePayload) {
        updatePreview(codePayload);
      }
    }
  }, [codePayload, files, isVisible]);

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center p-4">
        <Button
          variant="outline"
          onClick={() => onToggle?.(true)}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Show Live Preview
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2 bg-[#1a2028]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Live Preview
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="text-xs text-gray-400">
                {connectionStatus === 'connected' ? 'LIVE' :
                 connectionStatus === 'connecting' ? 'CONNECTING' :
                 'DISCONNECTED'}
              </span>
            </div>
            {lastUpdate && (
              <Badge variant="outline" className="text-xs">
                Updated {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Viewport Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('desktop')}
                className="px-2 py-1"
              >
                <Monitor className="w-3 h-3" />
              </Button>
              <Button
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('tablet')}
                className="px-2 py-1"
              >
                <Tablet className="w-3 h-3" />
              </Button>
              <Button
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('mobile')}
                className="px-2 py-1"
              >
                <Smartphone className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={isLoading}
              className="px-2 py-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle?.(false)}
              className="px-2 py-1"
            >
              <EyeOff className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="border-t border-gray-200 dark:border-gray-800 dark:bg-gray-900 flex justify-center overflow-auto bg-[#1a2028]"
          style={{ minHeight: '400px' }}
        >
          <div 
            className="transition-all duration-300 ease-in-out"
            style={{ 
              width: viewportSizes[viewport].width, 
              maxWidth: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full border-0 bg-white"
              style={{ 
                height: viewportSizes[viewport].height,
                minHeight: '400px'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePreview;