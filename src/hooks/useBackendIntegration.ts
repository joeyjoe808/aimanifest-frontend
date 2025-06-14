import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';

// Core types for backend integration mapping
export interface BackendAction {
  id: string;
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  requiresAuth: boolean;
  payload?: any;
  headers?: Record<string, string>;
  websocketChannel?: string;
  expectedResponse: string;
  errorHandling: {
    401: string; // Unauthorized
    403: string; // Forbidden
    404: string; // Not Found
    500: string; // Server Error
    default: string;
  };
  loadingState: string;
  successState: string;
  retryable: boolean;
}

// Pre-mapped button actions based on existing codebase
export const BUTTON_ACTION_MAP: Record<string, BackendAction> = {
  'generate-app': {
    id: 'generate-app',
    label: 'Generate App',
    method: 'POST',
    endpoint: '/api/ai/master-agent',
    requiresAuth: false,
    payload: { prompt: 'string', files: 'FormData' },
    headers: { 'Content-Type': 'multipart/form-data' },
    websocketChannel: 'agent:status',
    expectedResponse: 'Project creation and file generation',
    errorHandling: {
      401: 'Please log in to generate applications',
      403: 'You do not have permission to create projects',
      404: 'AI service not found',
      500: 'AI generation service temporarily unavailable',
      default: 'Failed to generate application'
    },
    loadingState: 'Creating your application...',
    successState: 'Application generated successfully',
    retryable: true
  },
  
  'view-projects': {
    id: 'view-projects',
    label: 'View My Projects',
    method: 'GET',
    endpoint: '/api/projects',
    requiresAuth: true,
    expectedResponse: 'Array of user projects',
    errorHandling: {
      401: 'Please log in to view your projects',
      403: 'Access denied to projects',
      404: 'No projects found',
      500: 'Unable to load projects',
      default: "Couldn't load your projects"
    },
    loadingState: 'Loading your projects...',
    successState: 'Projects loaded successfully',
    retryable: true
  },

  'run-ai-agent': {
    id: 'run-ai-agent',
    label: 'Run AI Agent',
    method: 'POST',
    endpoint: '/api/agents/run',
    requiresAuth: true,
    payload: { projectId: 'number', agentType: 'string', context: 'object' },
    websocketChannel: 'agent:status',
    expectedResponse: 'Agent execution status and results',
    errorHandling: {
      401: 'Authentication required to run AI agents',
      403: 'Insufficient permissions for AI agent execution',
      404: 'AI agent not found',
      500: 'AI agent service unavailable',
      default: 'Failed to execute AI agent'
    },
    loadingState: 'Running AI agent...',
    successState: 'AI agent completed successfully',
    retryable: true
  },

  'save-project': {
    id: 'save-project',
    label: 'Save Project',
    method: 'PATCH',
    endpoint: '/api/projects/:id',
    requiresAuth: true,
    payload: { files: 'object', name: 'string', description: 'string' },
    expectedResponse: 'Updated project data',
    errorHandling: {
      401: 'Please log in to save projects',
      403: 'You do not own this project',
      404: 'Project not found',
      500: 'Failed to save project',
      default: 'Unable to save project'
    },
    loadingState: 'Saving project...',
    successState: 'Project saved successfully',
    retryable: true
  },

  'deploy-netlify': {
    id: 'deploy-netlify',
    label: 'Deploy to Netlify',
    method: 'POST',
    endpoint: '/api/deploy/netlify',
    requiresAuth: true,
    payload: { projectId: 'number', config: 'object' },
    websocketChannel: 'deploy:status',
    expectedResponse: 'Deployment URL and status',
    errorHandling: {
      401: 'Login required for deployment',
      403: 'Deployment permissions required',
      404: 'Project not found for deployment',
      500: 'Deployment service unavailable',
      default: 'Deployment failed'
    },
    loadingState: 'Deploying to Netlify...',
    successState: 'Deployed successfully',
    retryable: true
  },

  'export-project': {
    id: 'export-project',
    label: 'Export Project',
    method: 'POST',
    endpoint: '/api/projects/:id/export',
    requiresAuth: true,
    expectedResponse: 'Download link for project files',
    errorHandling: {
      401: 'Login required to export projects',
      403: 'You do not own this project',
      404: 'Project not found',
      500: 'Export service unavailable',
      default: 'Failed to export project'
    },
    loadingState: 'Preparing export...',
    successState: 'Export ready for download',
    retryable: true
  },

  'chat-ai': {
    id: 'chat-ai',
    label: 'Send Message',
    method: 'POST',
    endpoint: '/api/projects/:projectId/chat',
    requiresAuth: true,
    payload: { content: 'string', messageType: 'string' },
    websocketChannel: 'chat:message',
    expectedResponse: 'AI response and updated chat history',
    errorHandling: {
      401: 'Please log in to chat with AI',
      403: 'Chat access denied',
      404: 'Project not found',
      500: 'AI chat service unavailable',
      default: 'Failed to send message'
    },
    loadingState: 'AI is thinking...',
    successState: 'Message sent',
    retryable: true
  }
};

// Custom hook for backend integration
export function useBackendIntegration() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setLocation] = useLocation();

  const executeAction = useCallback(async (
    actionId: string,
    payload?: any,
    options?: { 
      onSuccess?: (data: any) => void;
      onError?: (error: string) => void;
      skipAuthCheck?: boolean;
    }
  ) => {
    const action = BUTTON_ACTION_MAP[actionId];
    if (!action) {
      throw new Error(`Unknown action: ${actionId}`);
    }

    setLoading(prev => ({ ...prev, [actionId]: true }));
    setErrors(prev => ({ ...prev, [actionId]: '' }));

    try {
      // Check authentication if required
      if (action.requiresAuth && !options?.skipAuthCheck) {
        const authResponse = await fetch('/api/auth/user');
        if (authResponse.status === 401) {
          setLocation('/login');
          return;
        }
      }

      // Prepare request
      const url = action.endpoint.replace(/:(\w+)/g, (match, param) => {
        return payload?.[param] || match;
      });

      const requestOptions: RequestInit = {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          ...action.headers,
        } as HeadersInit,
      };

      if (action.method !== 'GET' && payload) {
        if (payload instanceof FormData) {
          requestOptions.body = payload;
          delete requestOptions.headers!['Content-Type'];
        } else {
          requestOptions.body = JSON.stringify(payload);
        }
      }

      // Execute request
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorMessage = action.errorHandling[response.status as keyof typeof action.errorHandling] 
          || action.errorHandling.default;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => ({ ...prev, [actionId]: errorMessage }));
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [actionId]: false }));
    }
  }, [setLocation]);

  const isLoading = useCallback((actionId: string) => loading[actionId] || false, [loading]);
  const getError = useCallback((actionId: string) => errors[actionId] || '', [errors]);
  const clearError = useCallback((actionId: string) => {
    setErrors(prev => ({ ...prev, [actionId]: '' }));
  }, []);

  return {
    executeAction,
    isLoading,
    getError,
    clearError,
    getActionConfig: (actionId: string) => BUTTON_ACTION_MAP[actionId]
  };
}