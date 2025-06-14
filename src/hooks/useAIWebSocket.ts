import { useEffect, useRef, useState, useCallback } from 'react';

interface AIWebSocketConfig {
  projectId?: string;
  autoConnect?: boolean;
  authToken?: string;
}

interface AIResponse {
  success: boolean;
  result?: any;
  error?: string;
  agentType?: string;
  timestamp: string;
}

interface ManifestUpdate {
  manifest: any;
  totalButtons: number;
  timestamp: string;
}

interface CodeGeneration {
  success: boolean;
  code?: string;
  fileName?: string;
  language?: string;
  explanation?: string;
  error?: string;
  timestamp: string;
}

export function useAIWebSocket(config: AIWebSocketConfig = {}) {
  const { projectId, autoConnect = true, authToken } = config;
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Event handlers
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [manifestUpdate, setManifestUpdate] = useState<ManifestUpdate | null>(null);
  const [codeGeneration, setCodeGeneration] = useState<CodeGeneration | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Environment-aware WebSocket connection with proper fallback
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const wsUrl = isProduction 
        ? 'wss://ai-manifest-ws.fly.dev/' 
        : `ws://localhost:5000/ws`;
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      const socket = new WebSocket(wsUrl);
      
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Connected to AI Manifest WebSocket');
        setIsConnected(true);
        setConnectionError(null);
        setIsAuthenticated(true); // Auto-authenticate for local development

        // Subscribe to project updates if projectId provided
        if (projectId) {
          socket.send(JSON.stringify({
            type: 'subscribe_preview',
            projectId: projectId
          }));
        }
      };

      socket.onclose = () => {
        console.log('Disconnected from AI Manifest WebSocket');
        setIsConnected(false);
        setIsAuthenticated(false);
      };

      socket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        const errorMsg = isProduction 
          ? 'External WebSocket server unavailable - some real-time features may be limited'
          : 'Local WebSocket server not responding - check server status';
        setConnectionError(errorMsg);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'ai:processing':
              setIsProcessing(true);
              break;
            case 'ai:response':
              setAiResponse(message.data);
              setIsProcessing(false);
              break;
            case 'ai:error':
              setAiResponse({
                success: false,
                error: message.data?.error || 'AI processing error',
                timestamp: new Date().toISOString()
              });
              setIsProcessing(false);
              break;
            case 'manifest:update':
              setManifestUpdate(message.data);
              setIsProcessing(false);
              break;
            case 'code:generated':
              setCodeGeneration(message.data);
              setIsProcessing(false);
              break;
            case 'subscription_confirmed':
              console.log('Preview subscription confirmed for project', message.projectId);
              break;
            default:
              console.log('Received WebSocket message:', message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to initialize WebSocket connection');
    }
  }, [projectId]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
      setIsAuthenticated(false);
    }
  }, []);

  // Send AI request
  const sendAIRequest = useCallback((prompt: string, agentType?: string, context?: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError('Not connected to WebSocket');
      return;
    }

    setIsProcessing(true);
    socketRef.current.send(JSON.stringify({
      type: 'user_request',
      data: {
        description: prompt,
        agentType,
        context
      },
      projectId
    }));
  }, [projectId]);

  // Scan button manifest
  const scanManifest = useCallback((componentPath?: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError('Not connected to WebSocket');
      return;
    }

    setIsProcessing(true);
    socketRef.current.send(JSON.stringify({
      type: 'manifest:scan',
      data: {
        componentPath
      },
      projectId
    }));
  }, [projectId]);

  // Generate code
  const generateCode = useCallback((
    prompt: string, 
    codeType?: string, 
    targetFile?: string, 
    existingCode?: string
  ) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError('Not connected to WebSocket');
      return;
    }

    setIsProcessing(true);
    socketRef.current.send(JSON.stringify({
      type: 'code:generate',
      data: {
        prompt,
        codeType,
        targetFile,
        existingCode
      },
      projectId
    }));
  }, [projectId]);

  // Store context in agent memory
  const storeMemory = useCallback((context: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: 'memory:store',
      data: {
        context
      },
      projectId
    }));
  }, [projectId]);

  // Update live preview
  const updatePreview = useCallback((changes: any, previewUrl?: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: 'preview:update',
      data: {
        changes,
        previewUrl
      },
      projectId
    }));
  }, [projectId]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    // Connection state
    isConnected,
    isAuthenticated,
    connectionError,
    isProcessing,

    // Connection controls
    connect,
    disconnect,

    // AI interaction
    sendAIRequest,
    aiResponse,

    // Button manifest
    scanManifest,
    manifestUpdate,

    // Code generation
    generateCode,
    codeGeneration,

    // Collaboration
    storeMemory,
    updatePreview,

    // Direct socket access
    socket: socketRef.current
  };
}