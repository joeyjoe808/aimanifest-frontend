import { Users } from 'lucide-react';
import FileExplorer from './FileExplorer';
import type { AIAgent, Project } from '@/types/ide';

interface LeftSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
  agents: AIAgent[];
  project: Project | null;
  onFileSelect: (filename: string, content?: string) => void;
  activeView: 'files' | 'search' | 'agents' | 'git' | 'debug';
  generatedFiles?: Array<{ name: string; content: string; type: string }>;
}

export default function LeftSidebar({ width, agents, project, onFileSelect, activeView, generatedFiles = [] }: LeftSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'working':
        return 'bg-green-500 animate-pulse';
      case 'waiting':
        return 'bg-yellow-500';
      case 'monitoring':
        return 'bg-blue-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'files':
        return (
          <>
            {/* File Explorer */}
            <div className="border-b border-gray-700">
              <div className="p-3 bg-gray-750">
                <h3 className="text-sm font-semibold text-white">Files</h3>
              </div>
              <div className="p-2 space-y-1">
                {generatedFiles.map((file) => (
                  <div 
                    key={file.name}
                    className="flex items-center px-2 py-1.5 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => onFileSelect(file.name, file.content)}
                  >
                    <span className="text-xs text-gray-200">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <FileExplorer project={project} onFileSelect={onFileSelect} />
          </>
        );
      
      case 'search':
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Search</h3>
            <input 
              type="text" 
              placeholder="Search files..." 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          </div>
        );
      
      case 'agents':
        return (
          <div className="border-b border-gray-700">
            <div className="p-3 bg-gray-750">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                AI Team Status
              </h3>
            </div>
            
            <div className="p-2 space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(agent.status)}`} />
                    <span className="text-xs text-gray-200 truncate">{agent.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 capitalize ml-2 flex-shrink-0">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'git':
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Source Control</h3>
            <div className="text-xs text-gray-400">
              <div className="mb-2">Branch: main</div>
              <div>No changes</div>
            </div>
          </div>
        );
      
      case 'debug':
        return (
          <div className="p-3">
            <h3 className="text-sm font-semibold text-white mb-3">Debug Console</h3>
            <div className="text-xs text-gray-400">No active debug session</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 border-r border-gray-700 flex flex-col" style={{ width }}>
      {renderContent()}
    </div>
  );
}
