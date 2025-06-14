import { useState, ReactNode } from 'react';
import { useBackendIntegration, type BackendAction } from '@/hooks/useBackendIntegration';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SmartButtonProps {
  actionId: string;
  payload?: any;
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  customLoadingText?: string;
}

export function SmartButton({
  actionId,
  payload,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  onSuccess,
  onError,
  customLoadingText
}: SmartButtonProps) {
  const { executeAction, isLoading, getError, clearError, getActionConfig } = useBackendIntegration();
  const [showError, setShowError] = useState(false);
  
  const action = getActionConfig(actionId);
  const loading = isLoading(actionId);
  const error = getError(actionId);

  const handleClick = async () => {
    if (loading || disabled) return;
    
    clearError(actionId);
    setShowError(false);

    try {
      const result = await executeAction(actionId, payload, {
        onSuccess,
        onError: (err) => {
          setShowError(true);
          onError?.(err);
        }
      });
      
      if (result && !onSuccess) {
        // Default success behavior - could show toast notification
        console.log(`${action?.successState || 'Action completed successfully'}:`, result);
      }
    } catch (err) {
      setShowError(true);
      console.error(`Action ${actionId} failed:`, err);
    }
  };

  if (!action) {
    console.warn(`Unknown action ID: ${actionId}`);
    return (
      <Button variant="destructive" disabled>
        Unknown Action
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || loading}
        onClick={handleClick}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? (customLoadingText || action.loadingState) : children}
      </Button>
      
      {showError && error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded border border-red-300 dark:border-red-700 z-10 max-w-xs">
          {error}
          <button
            onClick={() => setShowError(false)}
            className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Wrapper components for common button types
export function GenerateAppButton({ prompt, files, onSuccess, onError }: {
  prompt: string;
  files?: File[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setStatus('Initializing AI agents...');

      const formData = new FormData();
      formData.append('prompt', prompt);
      files?.forEach(file => formData.append('files', file));

      const response = await fetch('/api/ai/master-agent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate app');
      }

      const result = await response.json();
      const jobId = result.jobId;

      if (jobId) {
        // Listen to WebSocket for real-time status updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'agent_status' && data.jobId === jobId) {
            setStatus(data.message || data.status);
            
            if (data.status === 'completed') {
              ws.close();
              setIsLoading(false);
              onSuccess?.(result);
            } else if (data.status === 'error') {
              ws.close();
              setIsLoading(false);
              onError?.(data.message || 'Generation failed');
            }
          }
        };

        ws.onerror = () => {
          setIsLoading(false);
          onError?.('Connection error');
        };
      } else {
        setIsLoading(false);
        onSuccess?.(result);
      }
    } catch (error) {
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !prompt.trim()}
      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {status || 'Generating...'}
        </>
      ) : (
        'Generate App →'
      )}
    </button>
  );
}

export function ViewProjectsButton({ onSuccess, onError }: {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projects = await response.json();
      onSuccess?.(projects);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-gray-700 hover:bg-gray-600 px-6 py-3 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </>
      ) : (
        <>
          📁 View My Projects
        </>
      )}
    </button>
  );
}

export function SaveProjectButton({ projectId, files, name, description, onSuccess, onError }: {
  projectId: number;
  files: object;
  name: string;
  description: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return (
    <SmartButton
      actionId="save-project"
      payload={{ id: projectId, files, name, description }}
      onSuccess={onSuccess}
      onError={onError}
      variant="outline"
    >
      💾 Save Project
    </SmartButton>
  );
}

export function DeployAppButton({ projectId, config, onSuccess, onError }: {
  projectId: number;
  config?: object;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setDeployLogs(['Starting deployment...']);
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, config }),
      });

      if (!response.ok) {
        throw new Error('Failed to start deployment');
      }

      const result = await response.json();
      const jobId = result.jobId;

      if (jobId) {
        // Listen to WebSocket for live deployment logs
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'deploy_log' && data.jobId === jobId) {
            setDeployLogs(prev => [...prev, data.message]);
            
            if (data.status === 'completed') {
              ws.close();
              setIsLoading(false);
              onSuccess?.(result);
            } else if (data.status === 'error') {
              ws.close();
              setIsLoading(false);
              onError?.(data.message || 'Deployment failed');
            }
          }
        };

        ws.onerror = () => {
          setIsLoading(false);
          onError?.('Connection error');
        };
      } else {
        setIsLoading(false);
        onSuccess?.(result);
      }
    } catch (error) {
      setIsLoading(false);
      onError?.(error instanceof Error ? error.message : 'Deployment failed');
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Deploying...
          </>
        ) : (
          <>
            🚀 Deploy App
          </>
        )}
      </button>
      
      {deployLogs.length > 0 && (
        <div className="bg-gray-900 p-3 rounded-lg max-h-32 overflow-y-auto">
          {deployLogs.map((log, index) => (
            <div key={index} className="text-sm text-green-400 font-mono">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExportProjectButton({ projectId, onSuccess, onError }: {
  projectId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return (
    <SmartButton
      actionId="export-project"
      payload={{ id: projectId }}
      onSuccess={onSuccess}
      onError={onError}
      variant="outline"
    >
      📦 Export Project
    </SmartButton>
  );
}

export function RunAIAgentButton({ projectId, agentType, context, onSuccess, onError }: {
  projectId: number;
  agentType: string;
  context?: object;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return (
    <SmartButton
      actionId="run-ai-agent"
      payload={{ projectId, agentType, context }}
      onSuccess={onSuccess}
      onError={onError}
      variant="default"
      className="bg-purple-600 hover:bg-purple-700"
    >
      🤖 Run AI Agent
    </SmartButton>
  );
}

export function ChatAIButton({ projectId, content, messageType, onSuccess, onError }: {
  projectId: number;
  content: string;
  messageType?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  return (
    <SmartButton
      actionId="chat-ai"
      payload={{ projectId, content, messageType }}
      onSuccess={onSuccess}
      onError={onError}
      size="sm"
    >
      Send
    </SmartButton>
  );
}

// Specialized buttons from the table specifications
export function DownloadSourceCodeButton({ projectId, onSuccess, onError }: {
  projectId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/export?projectId=${projectId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export project');
      }

      // Trigger ZIP download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}-source.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onSuccess?.({ downloaded: true });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Preparing...
        </>
      ) : (
        <>
          📦 Download Source Code
        </>
      )}
    </button>
  );
}

export function CloneProjectButton({ projectId, onSuccess, onError }: {
  projectId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/project/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to clone project');
      }

      const result = await response.json();
      onSuccess?.(result);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Clone failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Cloning...
        </>
      ) : (
        <>
          📋 Clone Project
        </>
      )}
    </button>
  );
}

export function InviteCollaboratorButton({ projectId, email, onSuccess, onError }: {
  projectId: number;
  email?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(email || '');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      onError?.('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, email: inviteEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      const result = await response.json();
      setShowModal(false);
      setInviteEmail('');
      onSuccess?.(result);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Invitation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white font-medium rounded-lg transition flex items-center gap-2"
      >
        👥 Invite Collaborator
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Invite Collaborator</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-gray-900"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function LaunchAppPreviewButton({ projectId, onSuccess, onError }: {
  projectId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/preview/live?projectId=${projectId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to launch preview');
      }

      const result = await response.json();
      setPreviewUrl(result.url);
      onSuccess?.(result);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </>
        ) : (
          <>
            🚀 Launch App Preview
          </>
        )}
      </button>

      {previewUrl && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
            <span className="text-sm text-gray-600">Live Preview:</span>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Open in new tab
            </a>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-96"
            title="App Preview"
          />
        </div>
      )}
    </div>
  );
}