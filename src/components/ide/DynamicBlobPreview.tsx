import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RotateCcw, 
  Download, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useBlobPreview } from '@/hooks/useBlobPreview';

interface DynamicBlobPreviewProps {
  projectId?: number;
  className?: string;
}

export default function DynamicBlobPreview({ projectId, className }: DynamicBlobPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { previewState, refreshPreview } = useBlobPreview(projectId);

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
    if (previewState.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (previewState.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (previewState.isLoading) return 'Loading preview...';
    if (previewState.error) return previewState.error;
    return 'Live preview ready';
  };

  const handleExportZip = async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${projectId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleOpenExternal = () => {
    if (previewState.blobUrl) {
      window.open(previewState.blobUrl, '_blank');
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Dynamic Preview</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Blob Injection
          </Badge>
        </div>
      </CardHeader>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
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
            onClick={refreshPreview}
            disabled={previewState.isLoading}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
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
            disabled={!previewState.blobUrl}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {previewState.lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Dynamic Preview Content */}
      <CardContent className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
        <div 
          className="mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={getViewModeStyles()}
        >
          {previewState.blobUrl ? (
            <iframe
              ref={iframeRef}
              src={previewState.blobUrl}
              title="Dynamic Blob Preview"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              className="w-full h-full border-0"
              style={{ 
                minHeight: viewMode === 'desktop' ? '600px' : 'auto'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Dynamic Preview Ready</h3>
                <p className="text-sm">Waiting for code updates...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}