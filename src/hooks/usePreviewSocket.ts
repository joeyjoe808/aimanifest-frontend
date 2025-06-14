import { useEffect, useState, useCallback } from 'react';

interface PreviewPayload {
  html: string;
  css?: string;
  js?: string;
}

interface PreviewSocketOptions {
  projectId?: number;
  enabled?: boolean;
}

export const usePreviewSocket = (options: PreviewSocketOptions = {}) => {
  const { projectId, enabled = true } = options;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [previewData, setPreviewData] = useState<PreviewPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const sendToLivePreview = useCallback((payload: PreviewPayload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'preview_update',
        data: {
          projectId,
          ...payload
        }
      }));
    } else {
      // If socket not available, update local state directly
      setPreviewData(payload);
      setLastUpdate(new Date());
    }
  }, [socket, projectId]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      
      // Subscribe to preview updates for this project
      ws.send(JSON.stringify({
        type: 'subscribe_preview',
        data: { projectId }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'preview_update' && message.data.projectId === projectId) {
          setPreviewData({
            html: message.data.html,
            css: message.data.css,
            js: message.data.js
          });
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Preview socket message error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('Preview socket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [enabled, projectId]);

  return {
    socket,
    isConnected,
    previewData,
    lastUpdate,
    sendToLivePreview
  };
};

export default usePreviewSocket;