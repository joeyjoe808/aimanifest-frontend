import { Bot, GripVertical, Activity } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChat from '../AIChat';
import LivePreview from './LivePreview';
import { SystemChecks } from './SystemChecks';
import ConversationalHints from './ConversationalHints';
import type { ChatMessage, Project, TaskRequest } from '@/types/ide';

interface RightSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
  chatMessages: ChatMessage[];
  onAITask: (task: Omit<TaskRequest, 'projectId'>) => void;
  project: Project | null;
  isConnected: boolean;
  files: Record<string, string>;
}

export default function RightSidebar({ 
  width, 
  onWidthChange,
  chatMessages, 
  onAITask, 
  project, 
  isConnected,
  files
}: RightSidebarProps) {
  const [chatHeight, setChatHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return;
    
    const container = resizeRef.current.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newHeight = e.clientY - containerRect.top;
    const maxHeight = containerRect.height - 200; // Reserve space for preview panel
    
    setChatHeight(Math.max(200, Math.min(newHeight, maxHeight)));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="bg-gray-800 border-l border-gray-700 flex flex-col h-screen" style={{ width }}>
      <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-750 border-b border-gray-700 flex-shrink-0">
          <TabsTrigger value="chat" className="flex items-center gap-2 text-xs py-2">
            <Bot className="h-3 w-3" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2 text-xs py-2">
            <Bot className="h-3 w-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2 text-xs py-2">
            <Activity className="h-3 w-3" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 m-0 p-0 h-full">
          <div className="h-full">
            <AIChat
              projectId={project?.id || 'demo'}
              className="h-full"
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 flex flex-col m-0 p-0 h-full">
          <div className="p-2 bg-gray-750 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-xs font-semibold text-white flex items-center">
              <Bot className="h-3 w-3 text-blue-400 mr-2" />
              Live Preview
              <div className="ml-auto flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </h3>
          </div>
          <div className="flex-1">
            <LivePreview 
              files={files}
              isVisible={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="checks" className="flex-1 m-0 p-0 h-full">
          <div className="h-full overflow-y-auto">
            <SystemChecks />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
