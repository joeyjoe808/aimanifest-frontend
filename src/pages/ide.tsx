import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BrowserTabs from '@/components/ide/BrowserTabs';
import RightSidebar from '@/components/ide/RightSidebar';
import { useWebSocket } from '@/hooks/useWebSocket';
import usePreviewSocket from '@/hooks/usePreviewSocket';
import LivePreviewComponent from '@/components/LivePreview';
import AIChat from '@/components/AIChat';
import { apiRequest } from '@/lib/queryClient';
import type { Project, AIAgent, ChatMessage, TaskRequest } from '@/types/ide';

export default function IDE() {
  const params = useParams<{ id?: string; shareUrl?: string }>();
  const queryClient = useQueryClient();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(384);

  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Load AI agents status
  const { data: agents = [] } = useQuery<AIAgent[]>({
    queryKey: ['/api/agents/status'],
    refetchInterval: 5000,
  });

  // WebSocket connection for real-time AI communication
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:5000/ws-live');
        
        ws.onopen = () => {
          setConnectionStatus('connected');
          console.log('IDE connected to AI Manifest Engine');
          
          // Send initial project request
          if (ws) {
            ws.send(JSON.stringify({
              type: 'init_project',
              projectId: params.id || 'demo_project',
              timestamp: new Date().toISOString()
            }));
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            if (data.type === 'project_update') {
              setCurrentProject(prev => prev ? { ...prev, ...data.updates } : null);
            }
          } catch (error) {
            console.error('WebSocket message parsing error:', error);
          }
        };
        
        ws.onclose = () => {
          setConnectionStatus('disconnected');
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        };
        
        ws.onerror = () => {
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [params.id]);

  // Load chat messages with proper cleanup
  const { data: chatMessages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/projects/1/chat'],
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Submit AI task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async (taskRequest: TaskRequest) => {
      const response = await apiRequest('POST', '/api/tasks', taskRequest);
      return response.json();
    }
  });

  // Initialize default project
  useEffect(() => {
    if (!currentProject) {
      setCurrentProject({
        id: 1,
        name: 'AI Development Project',
        description: 'Interactive AI-powered development environment',
        files: {},
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, [currentProject]);

  // Handle AI task requests
  const handleAITask = (task: Omit<TaskRequest, 'projectId'>) => {
    const fullTask: TaskRequest = {
      ...task,
      projectId: 1,
      context: {
        ...task.context,
        projectId: 1
      }
    };

    submitTaskMutation.mutate(fullTask);
  };

  // Pass connection status directly to components

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col bg-gray-900 text-white">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Browser/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <BrowserTabs />
          </div>
        </div>

        {/* Right Sidebar - AI Chat */}
        <div className="flex-shrink-0 overflow-hidden">
          <RightSidebar
            width={rightSidebarWidth}
            onWidthChange={setRightSidebarWidth}
            chatMessages={chatMessages}
            onAITask={handleAITask}
            isConnected={connectionStatus === 'connected'}
            project={currentProject}
            files={{}}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm flex-shrink-0 border-t border-blue-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
          </div>
          <span>Active Agents: {agents.filter(agent => agent.status === 'active').length}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>AI Manifest Engine Ready</span>
        </div>
      </div>
    </div>
  );
}