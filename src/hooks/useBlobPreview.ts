import { useState, useEffect, useRef, useCallback } from 'react';

interface BlobPreviewState {
  blobUrl: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
}

export function useBlobPreview(projectId?: number) {
  const [previewState, setPreviewState] = useState<BlobPreviewState>({
    blobUrl: null,
    isLoading: false,
    error: null,
    lastUpdated: new Date()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const currentBlobRef = useRef<string | null>(null);

  const updatePreview = useCallback((htmlCode: string) => {
    // Clean up previous blob URL
    if (currentBlobRef.current) {
      URL.revokeObjectURL(currentBlobRef.current);
    }

    // Create new blob with sandboxed HTML
    const secureHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval';">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: system-ui, sans-serif; }
        </style>
      </head>
      <body>
        ${htmlCode}
      </body>
      </html>
    `;

    const blob = new Blob([secureHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    currentBlobRef.current = blobUrl;
    
    setPreviewState(prev => ({
      ...prev,
      blobUrl,
      isLoading: false,
      error: null,
      lastUpdated: new Date()
    }));
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!projectId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Blob Preview WebSocket connected');
        ws.send(JSON.stringify({
          type: 'subscribe_preview',
          projectId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'codeUpdate' || data.type === 'refreshPreview') {
            if (data.html || data.payload?.html) {
              updatePreview(data.html || data.payload.html);
            }
          }
          
          if (data.type === 'previewError') {
            setPreviewState(prev => ({
              ...prev,
              isLoading: false,
              error: data.payload?.error || 'Preview error occurred'
            }));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setPreviewState(prev => ({
          ...prev,
          error: 'WebSocket connection failed'
        }));
      };

      ws.onclose = () => {
        console.log('Blob Preview WebSocket disconnected');
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setPreviewState(prev => ({
        ...prev,
        error: 'Failed to connect to live preview service'
      }));
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId, updatePreview]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBlobRef.current) {
        URL.revokeObjectURL(currentBlobRef.current);
      }
    };
  }, []);

  const refreshPreview = useCallback(() => {
    setPreviewState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Trigger refresh via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'refresh_request',
        projectId
      }));
    }
  }, [projectId]);

  return {
    previewState,
    updatePreview,
    refreshPreview
  };
}