import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  projectId?: string;
}

export function useWebSocket(url: string, projectId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected to AI Manifest');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
        ws.send(JSON.stringify({ type: 'joinProject', data: { projectId } }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          console.log(`Reconnecting... Attempt ${reconnectAttempts.current + 1}`);
          setTimeout(connect, 2000 * Math.pow(2, reconnectAttempts.current));
          reconnectAttempts.current += 1;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }, [url, projectId]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  useEffect(() => {
    const ws = connect();
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connect]);

  return { 
    socket, 
    isConnected, 
    lastMessage, 
    sendMessage,
    reconnectAttempts: reconnectAttempts.current 
  };
}