import { Button } from '@/components/ui/button';
import { Play, Share, Bot } from 'lucide-react';
import type { Project } from '@/types/ide';

interface MenuBarProps {
  project: Project | null;
  onRunProject: () => void;
  onShareProject: () => void;
}

export default function MenuBar({ project, onRunProject, onShareProject }: MenuBarProps) {
  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-white">AI Engineering Team</span>
        </div>
        
        <nav className="flex space-x-4 text-sm">
          <button className="text-gray-300 hover:text-white transition-colors">File</button>
          <button className="text-gray-300 hover:text-white transition-colors">Edit</button>
          <button className="text-gray-300 hover:text-white transition-colors">View</button>
          <button className="text-gray-300 hover:text-white transition-colors">AI</button>
          <button className="text-gray-300 hover:text-white transition-colors">Deploy</button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onRunProject}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8 text-sm"
        >
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
        
        <Button 
          onClick={onShareProject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-sm"
        >
          <Share className="h-3 w-3 mr-1" />
          Share
        </Button>
        
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium">U</span>
        </div>
      </div>
    </div>
  );
}
