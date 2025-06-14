import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';

interface SimpleBlobPreviewProps {
  htmlContent?: string;
  className?: string;
  showControls?: boolean;
}

export default function SimpleBlobPreview({ 
  htmlContent = '<!DOCTYPE html><html><head><title>Live Preview</title></head><body><h1>Ready for content...</h1></body></html>', 
  className,
  showControls = true 
}: SimpleBlobPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Clean up previous blob
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    // Create enhanced HTML with responsive meta tags and base styles
    const enhancedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;">
        <style>
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            font-family: system-ui, -apple-system, sans-serif; 
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([enhancedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    setBlobUrl(url);
    setLastUpdate(new Date());

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [htmlContent, blobUrl]);

  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px', margin: '0 auto' };
      case 'tablet':
        return { width: '768px', height: '1024px', margin: '0 auto' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleExportZip = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      zip.file('index.html', htmlContent);
      zip.file('README.md', `# Exported Project\n\nGenerated: ${new Date().toISOString()}\n\nOpen index.html in a browser to view the application.`);
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {showControls && (
        <>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <Badge variant="secondary" className="text-xs">Blob Injection</Badge>
            </div>
          </CardHeader>

          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
                className="h-8 w-8 p-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tablet')}
                className="h-8 w-8 p-0"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
                className="h-8 w-8 p-0"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
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
                onClick={handleExportZip}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b text-xs text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </>
      )}

      <CardContent className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
          style={getViewportStyles()}
        >
          <iframe
            ref={iframeRef}
            title="Simple Blob Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="w-full h-full border-0"
            style={{ minHeight: viewMode === 'desktop' ? '500px' : '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}