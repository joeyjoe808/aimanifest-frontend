import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Hook for WebSocket connection
function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('WebSocket connected');
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      setError('WebSocket connection failed');
      console.error('WebSocket error:', error);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, []);

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ event, data }));
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      const handler = (e: MessageEvent) => {
        try {
          const message = JSON.parse(e.data);
          if (message.event === event) {
            callback(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.addEventListener('message', handler);
      
      return () => {
        socket.removeEventListener('message', handler);
      };
    }
  };

  return { socket, isConnected, error, emit, on };
}

interface SmartButtonProps {
  id?: string;
  label: string;
  actionId?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
  // Real-time configuration
  realtime?: boolean;
  socketEvent?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: Record<string, any>;
  // Enhanced features
  showProgress?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  debounceMs?: number;
  requireConfirmation?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  children?: React.ReactNode;
}

export function SmartButton({
  id,
  label,
  actionId,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className,
  realtime = false,
  socketEvent,
  endpoint,
  method = 'POST',
  payload = {},
  showProgress = true,
  autoRetry = false,
  maxRetries = 3,
  debounceMs = 300,
  requireConfirmation = false,
  loadingText,
  successText,
  errorText,
  children
}: SmartButtonProps) {
  const { toast } = useToast();
  const { socket, isConnected, emit, on } = useSocket();
  
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [confirmation, setConfirmation] = useState(false);

  // REST API mutation for non-realtime actions
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (!endpoint) throw new Error('No endpoint configured');
      return apiRequest(method, endpoint, { ...payload, ...data });
    },
    onSuccess: (data) => {
      setState('success');
      setProgress(100);
      setRetryCount(0);
      
      toast({
        title: "Action Successful",
        description: successText || `${label} completed successfully`,
      });
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 2000);
    },
    onError: (error: any) => {
      setState('error');
      setProgress(0);
      
      if (autoRetry && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          handleAction();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        toast({
          title: "Action Failed",
          description: errorText || error.message || `${label} failed`,
          variant: "destructive",
        });
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          setState('idle');
          setRetryCount(0);
        }, 3000);
      }
    },
  });

  // WebSocket event handling for realtime actions
  useEffect(() => {
    if (realtime && socketEvent && on) {
      const cleanup = on(`${socketEvent}:progress`, (data: any) => {
        setProgress(data.progress || 0);
      });
      
      const cleanupSuccess = on(`${socketEvent}:success`, (data: any) => {
        setState('success');
        setProgress(100);
        setRetryCount(0);
        
        toast({
          title: "Live Action Successful",
          description: successText || data.message || `${label} completed`,
        });
        
        setTimeout(() => {
          setState('idle');
          setProgress(0);
        }, 2000);
      });
      
      const cleanupError = on(`${socketEvent}:error`, (data: any) => {
        setState('error');
        setProgress(0);
        
        toast({
          title: "Live Action Failed",
          description: errorText || data.error || `${label} failed`,
          variant: "destructive",
        });
        
        setTimeout(() => {
          setState('idle');
          setRetryCount(0);
        }, 3000);
      });
      
      return () => {
        cleanup?.();
        cleanupSuccess?.();
        cleanupError?.();
      };
    }
  }, [realtime, socketEvent, on, label, successText, errorText, toast]);

  const handleAction = () => {
    // Debounce rapid clicks
    const now = Date.now();
    if (now - lastClickTime < debounceMs) {
      return;
    }
    setLastClickTime(now);

    // Confirmation check
    if (requireConfirmation && !confirmation) {
      setConfirmation(true);
      setTimeout(() => setConfirmation(false), 5000); // Reset after 5 seconds
      return;
    }
    
    setConfirmation(false);
    setState('loading');
    setProgress(0);

    if (realtime && socketEvent && emit) {
      // Emit WebSocket event for realtime actions
      emit(socketEvent, { 
        id: id || actionId,
        action: actionId || label,
        payload: {
          ...payload,
          timestamp: new Date().toISOString()
        }
      });
    } else if (endpoint) {
      // Execute REST API call
      mutation.mutate({
        id: id || actionId,
        action: actionId || label,
        timestamp: new Date().toISOString()
      });
    } else if (onClick) {
      // Custom onClick handler
      try {
        onClick();
        setState('success');
        setTimeout(() => setState('idle'), 2000);
      } catch (error) {
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    }
  };

  const getButtonText = () => {
    if (requireConfirmation && confirmation) {
      return `Confirm ${label}?`;
    }
    
    switch (state) {
      case 'loading':
        return loadingText || `${label}...`;
      case 'success':
        return successText || `${label} Complete`;
      case 'error':
        if (autoRetry && retryCount > 0) {
          return `Retrying... (${retryCount}/${maxRetries})`;
        }
        return errorText || `${label} Failed`;
      default:
        return label;
    }
  };

  const getButtonIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        if (realtime) {
          return isConnected ? (
            <Zap className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          );
        }
        return null;
    }
  };

  const getVariant = () => {
    if (requireConfirmation && confirmation) {
      return 'destructive';
    }
    
    switch (state) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return variant;
    }
  };

  const isDisabled = disabled || 
    state === 'loading' || 
    (realtime && !isConnected) ||
    (mutation.isPending);

  return (
    <div className="relative inline-block">
      <Button
        id={id}
        variant={getVariant()}
        size={size}
        disabled={isDisabled}
        onClick={handleAction}
        className={cn(
          'transition-all duration-200',
          state === 'loading' && 'animate-pulse',
          className
        )}
        aria-label={`${label} button`}
        aria-describedby={`${id || actionId}-status`}
      >
        <div className="flex items-center gap-2">
          {getButtonIcon()}
          <span>{getButtonText()}</span>
          {children}
        </div>
      </Button>

      {/* Progress indicator */}
      {showProgress && state === 'loading' && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b">
          <div
            className="h-full bg-blue-500 rounded-b transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status badges */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {realtime && (
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="text-xs px-1 py-0"
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </Badge>
        )}
        {autoRetry && retryCount > 0 && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {retryCount}/{maxRetries}
          </Badge>
        )}
      </div>

      {/* Screen reader status */}
      <div id={`${id || actionId}-status`} className="sr-only">
        {state === 'loading' && `${label} in progress`}
        {state === 'success' && `${label} completed successfully`}
        {state === 'error' && `${label} failed`}
        {realtime && !isConnected && 'Real-time connection unavailable'}
      </div>
    </div>
  );
}

// Example usage components
export function LiveStreamButton() {
  return (
    <SmartButton
      id="startLiveStream"
      label="Go Live"
      actionId="startLiveStream"
      realtime={true}
      socketEvent="live:start"
      variant="default"
      showProgress={true}
      requireConfirmation={true}
      loadingText="Starting Stream..."
      successText="Live!"
      errorText="Stream Failed"
    />
  );
}

export function SubmitFormButton() {
  return (
    <SmartButton
      id="submitForm"
      label="Submit"
      actionId="submitForm"
      endpoint="/api/form/submit"
      method="POST"
      variant="default"
      autoRetry={true}
      maxRetries={3}
      loadingText="Submitting..."
      successText="Submitted"
      errorText="Submit Failed"
    />
  );
}

export function ExportDataButton() {
  return (
    <SmartButton
      id="exportData"
      label="Export CSV"
      actionId="exportData"
      endpoint="/api/export/csv"
      method="POST"
      variant="outline"
      showProgress={true}
      loadingText="Exporting..."
      successText="Exported"
      errorText="Export Failed"
    />
  );
}

export default SmartButton;