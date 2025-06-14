export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
  isOpen?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  files: { [filename: string]: string };
  shareUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAgent {
  id: number;
  name: string;
  type: string;
  status: 'idle' | 'active' | 'working' | 'error' | 'monitoring';
  currentTask?: string;
  capabilities: string[];
  config: any;
}

export interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  projectId?: number;
  agentName?: string;
  messageType?: 'info' | 'success' | 'warning' | 'error';
  role?: 'user' | 'assistant';
}

export interface WebSocketMessage {
  type: string;
  data: any;
  projectId?: number;
}

export interface TaskRequest {
  type: 'GENERATE_CODE' | 'DEBUG_CODE' | 'DEPLOY_APP' | 'UI_COMPONENT' | 'BACKEND_API' | 'DATABASE_SCHEMA';
  description: string;
  projectId: number;
  context: {
    projectId: number;
    currentFiles?: Record<string, string>;
    framework?: string;
    styling?: string;
    requirements?: string[];
    assignedAgent?: string;
    estimatedTime?: number;
    attachedFiles?: string[];
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TaskResponse {
  success: boolean;
  result?: any;
  error?: string;
  agentName: string;
  recommendations?: string[];
}

export interface EditorTab {
  id: string;
  title: string;
  filename: string;
  content: string;
  language: string;
  isActive: boolean;
  isDirty: boolean;
}
