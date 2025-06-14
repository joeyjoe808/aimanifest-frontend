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
  Sparkles,
  Wand2
} from 'lucide-react';

interface MagicPreviewFrameProps {
  projectId?: number;
  className?: string;
}

interface PreviewState {
  html: string;
  lastUpdated: Date;
  status: 'loading' | 'ready' | 'error' | 'generating';
  errors: string[];
  generationType?: string;
}

export default function MagicPreviewFrame({ projectId = 1, className = '' }: MagicPreviewFrameProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    html: `
      <html>
        <head>
          <title>Magic Digital Picture Frame</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .magic-frame {
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
              background-size: 400% 400%;
              padding: 6px;
              border-radius: 30px;
              box-shadow: 0 25px 80px rgba(0,0,0,0.4);
              animation: magicGlow 4s ease-in-out infinite, frameShift 8s ease-in-out infinite;
              position: relative;
              max-width: 90vw;
              max-height: 85vh;
            }
            .frame-content {
              background: rgba(15, 15, 35, 0.98);
              padding: 80px 60px;
              border-radius: 24px;
              backdrop-filter: blur(15px);
              position: relative;
              overflow: hidden;
              min-height: 400px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .frame-content::before {
              content: '';
              position: absolute;
              top: -100%;
              left: -100%;
              width: 300%;
              height: 300%;
              background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.03) 90deg, transparent 180deg, rgba(255,255,255,0.03) 270deg, transparent 360deg);
              animation: shimmer 6s linear infinite;
            }
            .sparkle-field {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
              overflow: hidden;
            }
            .sparkle {
              position: absolute;
              color: #fff;
              font-size: 12px;
              animation: sparkleFloat 3s ease-in-out infinite;
              opacity: 0;
            }
            .sparkle:nth-child(1) { top: 20%; left: 15%; animation-delay: 0s; }
            .sparkle:nth-child(2) { top: 70%; left: 80%; animation-delay: 0.5s; }
            .sparkle:nth-child(3) { top: 40%; left: 90%; animation-delay: 1s; }
            .sparkle:nth-child(4) { top: 80%; left: 10%; animation-delay: 1.5s; }
            .sparkle:nth-child(5) { top: 15%; left: 70%; animation-delay: 2s; }
            .sparkle:nth-child(6) { top: 60%; left: 25%; animation-delay: 2.5s; }
            h1 { 
              font-size: 3.2rem; 
              margin-bottom: 20px; 
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
              background-size: 200% 200%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              position: relative;
              z-index: 2;
              animation: textShift 5s ease-in-out infinite;
              font-weight: 700;
              letter-spacing: -1px;
            }
            .subtitle { 
              font-size: 1.4rem; 
              opacity: 0.9; 
              margin-bottom: 40px;
              position: relative;
              z-index: 2;
              max-width: 600px;
              line-height: 1.5;
            }
            .magic-status { 
              display: inline-flex;
              align-items: center;
              gap: 12px;
              padding: 16px 28px;
              background: linear-gradient(45deg, rgba(46, 204, 113, 0.15), rgba(52, 152, 219, 0.15));
              border: 2px solid transparent;
              background-clip: padding-box;
              border-radius: 30px;
              position: relative;
              z-index: 2;
              animation: pulse 3s ease-in-out infinite;
              font-weight: 600;
              font-size: 1.1rem;
            }
            .magic-wand {
              animation: wandWave 2s ease-in-out infinite;
            }
            .instruction-text {
              position: absolute;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 0.9rem;
              opacity: 0.6;
              z-index: 2;
              animation: fadeInOut 4s ease-in-out infinite;
            }
            @keyframes magicGlow {
              0%, 100% { 
                box-shadow: 0 25px 80px rgba(255, 107, 107, 0.4);
                filter: hue-rotate(0deg);
              }
              25% { 
                box-shadow: 0 25px 80px rgba(78, 205, 196, 0.4);
                filter: hue-rotate(90deg);
              }
              50% { 
                box-shadow: 0 25px 80px rgba(69, 183, 209, 0.4);
                filter: hue-rotate(180deg);
              }
              75% { 
                box-shadow: 0 25px 80px rgba(150, 206, 180, 0.4);
                filter: hue-rotate(270deg);
              }
            }
            @keyframes frameShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes shimmer {
              0% { transform: translate(-100%, -100%) rotate(0deg); }
              100% { transform: translate(-100%, -100%) rotate(360deg); }
            }
            @keyframes sparkleFloat {
              0%, 100% { opacity: 0; transform: translateY(0px) scale(1); }
              50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
            }
            @keyframes textShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
            @keyframes wandWave {
              0%, 100% { transform: rotate(0deg) translateY(0px); }
              25% { transform: rotate(-10deg) translateY(-2px); }
              75% { transform: rotate(10deg) translateY(-2px); }
            }
            @keyframes fadeInOut {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 0.3; }
            }
            @media (max-width: 768px) {
              .frame-content { padding: 40px 30px; }
              h1 { font-size: 2.4rem; }
              .subtitle { font-size: 1.2rem; }
            }
          </style>
        </head>
        <body>
          <div class="magic-frame">
            <div class="frame-content">
              <div class="sparkle-field">
                <div class="sparkle">✨</div>
                <div class="sparkle">⭐</div>
                <div class="sparkle">💫</div>
                <div class="sparkle">✨</div>
                <div class="sparkle">⭐</div>
                <div class="sparkle">💫</div>
              </div>
              <h1>Magic Digital Picture Frame</h1>
              <p class="subtitle">
                Ask the AI to create something and watch it instantly appear in this magical frame
              </p>
              <div class="magic-status">
                <span class="magic-wand">🪄</span>
                Ready for AI Magic
              </div>
              <div class="instruction-text">
                Try: "Create a beautiful weather app" or "Build a todo list with animations"
              </div>
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

  // WebSocket connection for real-time magic updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Magic Preview Frame connected');
        ws.send(JSON.stringify({
          type: 'subscribe_preview',
          projectId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'preview_update' || data.type === 'master_update') {
            if (data.data?.html) {
              setPreviewState(prev => ({
                ...prev,
                html: data.data.html,
                lastUpdated: new Date(),
                status: 'ready',
                generationType: data.data.generationType || 'AI Creation'
              }));
            }
            
            if (data.data?.status) {
              setPreviewState(prev => ({
                ...prev,
                status: data.data.status
              }));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Magic Preview WebSocket error:', error);
        setPreviewState(prev => ({
          ...prev,
          status: 'error',
          errors: ['Connection lost to magic frame']
        }));
      };

      ws.onclose = () => {
        console.log('Magic Preview WebSocket disconnected');
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to connect to magic frame:', error);
    }
  }, [projectId]);

  // Update iframe content when preview state changes
  useEffect(() => {
    if (iframeRef.current && previewState.html) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewState.html);
        doc.close();
      }
    }
  }, [previewState.html]);

  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const getStatusIcon = () => {
    switch (previewState.status) {
      case 'loading':
      case 'generating':
        return <Wand2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <span className="text-red-400">⚠️</span>;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (previewState.status) {
      case 'loading':
        return 'Loading magic...';
      case 'generating':
        return 'AI is painting...';
      case 'error':
        return 'Magic interrupted';
      default:
        return 'Ready for magic';
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Magic Frame Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Magic Picture Frame
            </span>
          </div>
          {previewState.generationType && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {previewState.generationType}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Last updated: {previewState.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Magic Preview Content */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 p-4">
        <div 
          className="mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={getViewModeStyles()}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Magic Digital Picture Frame"
          />
        </div>

        {/* Error Display */}
        {previewState.errors.length > 0 && (
          <div className="absolute top-4 right-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 max-w-sm">
            <div className="text-sm text-red-700 dark:text-red-300">
              {previewState.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code View */}
      {showCode && (
        <div className="h-1/3 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-green-400 p-4 overflow-auto">
          <pre className="text-xs">
            <code>{previewState.html}</code>
          </pre>
        </div>
      )}
    </div>
  );
}