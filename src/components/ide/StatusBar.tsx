import { Wifi, WifiOff, Circle, Users, HardDrive, Globe, Activity, Cpu } from 'lucide-react';
import type { AIAgent, Project, WebContainerStatus } from '@/types/ide';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';

interface StatusBarProps {
  isConnected: boolean;
  containerStatus: WebContainerStatus;
  agents: AIAgent[];
  project: Project | null;
  onToggleBottomPanel: () => void;
}

export default function StatusBar({ 
  isConnected, 
  containerStatus, 
  agents, 
  project,
  onToggleBottomPanel 
}: StatusBarProps) {
  const { diagnostics } = useSystemDiagnostics();
  const activeAgents = agents.filter(agent => agent.status === 'active' || agent.status === 'working').length;
  const totalAgents = agents.length;

  const getMemoryUsage = () => {
    // Simulate memory usage calculation
    const baseMemory = 32;
    const fileMemory = project?.files ? Object.keys(project.files).length * 2 : 0;
    return Math.min(baseMemory + fileMemory, 512);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString();
  };

  const getActiveTabInfo = () => {
    // This would typically come from the editor state
    return {
      language: 'TypeScript React',
      encoding: 'UTF-8',
      line: 8,
      column: 12
    };
  };

  const tabInfo = getActiveTabInfo();
  const memoryUsage = getMemoryUsage();

  return (
    <div className="h-6 bg-blue-600 text-white px-4 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        {/* WebContainer Status */}
        <div className="flex items-center space-x-1">
          <Circle className={`h-2 w-2 ${containerStatus.isReady ? 'text-green-300 fill-current' : 'text-red-300 fill-current'}`} />
          <span>{containerStatus.isReady ? 'WebContainer Ready' : 'WebContainer Initializing'}</span>
        </div>

        {/* AI Agents Status */}
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{activeAgents}/{totalAgents} AI Agents Active</span>
        </div>

        {/* System Performance */}
        <div className="flex items-center space-x-1">
          <Cpu className="h-3 w-3" />
          <span>{diagnostics?.performance || 0}%</span>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center space-x-1">
          <HardDrive className="h-3 w-3" />
          <span>{diagnostics?.memory || `${memoryUsage}MB`}</span>
        </div>

        {/* Project Status */}
        {project && (
          <div className="flex items-center space-x-1">
            <Circle className="h-2 w-2 text-green-300 fill-current" />
            <span>{project.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* File Information */}
        <span>{tabInfo.language}</span>
        <span>{tabInfo.encoding}</span>
        <button 
          onClick={onToggleBottomPanel}
          className="hover:bg-blue-700 px-1 rounded transition-colors"
        >
          Ln {tabInfo.line}, Col {tabInfo.column}
        </button>

        {/* Network Status */}
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Branch/Version Info */}
        <div className="flex items-center space-x-1">
          <Globe className="h-3 w-3" />
          <span>main</span>
        </div>
      </div>
    </div>
  );
}
