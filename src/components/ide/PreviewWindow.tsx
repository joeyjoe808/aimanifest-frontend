import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RotateCcw, 
  ExternalLink, 
  Code, 
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PreviewWindowProps {
  projectId?: number;
  className?: string;
}

interface PreviewState {
  html: string;
  lastUpdated: Date;
  status: 'loading' | 'ready' | 'error';
  errors: string[];
}

export default function PreviewWindow({ projectId = 1, className = '' }: PreviewWindowProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    html: `
      <html>
        <head>
          <title>Magic Digital Picture Frame</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 40px; 
              background: radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .magic-frame {
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
              padding: 4px;
              border-radius: 24px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              animation: magicGlow 3s ease-in-out infinite alternate;
            }
            .frame-content {
              background: rgba(26, 26, 46, 0.95);
              padding: 60px 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
              position: relative;
              overflow: hidden;
            }
            .frame-content::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
              animation: shimmer 4s ease-in-out infinite;
            }
            h1 { 
              font-size: 2.8rem; 
              margin-bottom: 20px; 
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              position: relative;
              z-index: 1;
            }
            p { 
              font-size: 1.3rem; 
              opacity: 0.9; 
              margin-bottom: 30px;
              position: relative;
              z-index: 1;
            }
            .magic-status { 
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(45deg, rgba(46, 204, 113, 0.2), rgba(52, 152, 219, 0.2));
              border: 2px solid transparent;
              background-clip: padding-box;
              border-radius: 25px;
              position: relative;
              z-index: 1;
              animation: pulse 2s ease-in-out infinite;
            }
            .sparkles {
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 1.5rem;
              animation: twinkle 1.5s ease-in-out infinite;
            }
            @keyframes magicGlow {
              0% { box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3); }
              25% { box-shadow: 0 20px 60px rgba(78, 205, 196, 0.3); }
              50% { box-shadow: 0 20px 60px rgba(69, 183, 209, 0.3); }
              75% { box-shadow: 0 20px 60px rgba(150, 206, 180, 0.3); }
              100% { box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3); }
            }
            @keyframes shimmer {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.2); }
            }
          </style>
        </head>
        <body>
          <div class="magic-frame">
            <div class="frame-content">
              <div class="sparkles">✨</div>
              <h1>Magic Digital Picture Frame</h1>
              <p>Tell me what to create and watch it instantly appear!</p>
              <div class="magic-status">Ready for AI Magic</div>
            </div>
          </div>
        </body>
      </html>
    `,
    lastUpdated: new Date(),
    status: 'ready',
    errors: []
  });

  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Preview WebSocket connected');
        ws.send(JSON.stringify({
          type: 'subscribe_preview',
          projectId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'previewUpdate' && data.payload?.html) {
            setPreviewState(prev => ({
              ...prev,
              html: data.payload.html,
              lastUpdated: new Date(),
              status: 'ready',
              errors: []
            }));
          }
          
          if (data.type === 'previewError') {
            setPreviewState(prev => ({
              ...prev,
              status: 'error',
              errors: data.payload?.errors || ['Unknown preview error']
            }));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Preview WebSocket error:', error);
        setPreviewState(prev => ({
          ...prev,
          status: 'error',
          errors: ['WebSocket connection failed']
        }));
      };

      ws.onclose = () => {
        console.log('Preview WebSocket disconnected');
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  const getViewportDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setPreviewState(prev => ({
      ...prev,
      status: 'loading'
    }));
  };

  const openInNewTab = () => {
    const blob = new Blob([previewState.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const dimensions = getViewportDimensions();

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={previewState.status === 'ready' ? 'default' : 
                      previewState.status === 'error' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {previewState.status === 'ready' && <CheckCircle className="w-3 h-3 mr-1" />}
              {previewState.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {previewState.status.charAt(0).toUpperCase() + previewState.status.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {previewState.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="h-8 px-2"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tablet')}
              className="h-8 px-2"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="h-8 px-2"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="h-8 px-2"
            >
              {showCode ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              className="h-8 px-2"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="h-8 px-2"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full">
        {previewState.status === 'error' ? (
          <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-950/20">
            <div className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                Preview Error
              </h3>
              <div className="space-y-1">
                {previewState.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 dark:text-red-300">
                    {error}
                  </p>
                ))}
              </div>
              <Button 
                onClick={refreshPreview} 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : showCode ? (
          <div className="h-full overflow-auto">
            <pre className="text-xs p-4 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
              <code>{previewState.html}</code>
            </pre>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div 
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                maxWidth: '100%',
                maxHeight: '100%',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={previewState.html}
                title="Live Application Preview"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                className="w-full h-full border-0"
                style={{ 
                  minHeight: viewMode === 'desktop' ? '600px' : 'auto'
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}