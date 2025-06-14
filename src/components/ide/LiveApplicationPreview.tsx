import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Eye, EyeOff, Globe } from 'lucide-react';

interface LiveApplicationPreviewProps {
  projectId: number;
  generatedCode?: string;
}

export default function LiveApplicationPreview({ 
  projectId, 
  generatedCode 
}: LiveApplicationPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate the live preview URL
  useEffect(() => {
    const baseUrl = window.location.origin;
    const liveUrl = `${baseUrl}/preview/${projectId}`;
    setPreviewUrl(liveUrl);
  }, [projectId]);

  // Update project files when new code is generated
  useEffect(() => {
    if (generatedCode) {
      updateProjectFiles();
    }
  }, [generatedCode, projectId]);

  const updateProjectFiles = async () => {
    if (!generatedCode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update the project with new generated files
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'index.html': generatedCode
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update project files');
      }

      // Trigger WebSocket message to refresh live preview
      const ws = new WebSocket(`ws://${window.location.host}`);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'preview_update',
          projectId: projectId,
          data: { updated: true }
        }));
        ws.close();
      };

    } catch (error) {
      console.error('Failed to update project files:', error);
      setError('Failed to update live preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    // Force refresh the preview by reloading the URL
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <Card className="h-[600px] border-dashed border-2 border-gray-300 dark:border-gray-600">
        <div className="h-full flex items-center justify-center">
          <Button 
            variant="outline" 
            onClick={toggleVisibility}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Show Live Preview
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="font-medium">Live Preview</span>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleVisibility}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        {error ? (
          <div className="h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateProjectFiles}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white dark:bg-gray-900 relative">
            {/* Live Preview Display */}
            <div className="absolute inset-0 flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-700 rounded px-3 py-1 text-sm font-mono text-[#1a2028]">
                  {previewUrl}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  LIVE
                </div>
              </div>
              
              <div className="flex-1 relative">
                <iframe
                  src={previewUrl}
                  title="Live Application Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setError('Failed to load live preview')}
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading live preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}