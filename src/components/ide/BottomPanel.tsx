import { useState, useRef, useEffect } from 'react';
import { Terminal, FileText, Bot, Bug, Maximize2, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Project } from '@/types/ide';

interface BottomPanelProps {
  height: number;
  onHeightChange: (height: number) => void;
  onClose: () => void;
  containerStatus: 'idle' | 'booting' | 'installing' | 'running' | 'error';
  project: Project | null;
}

interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'success';
  timestamp: Date;
}

export default function BottomPanel({ 
  height, 
  onHeightChange, 
  onClose, 
  containerStatus,
  project 
}: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'ai-chat' | 'debug'>('terminal');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      content: '$ npm run dev',
      type: 'command',
      timestamp: new Date()
    },
    {
      id: '2',
      content: '  VITE v4.4.5  ready in 234 ms',
      type: 'output',
      timestamp: new Date()
    },
    {
      id: '3',
      content: '  ➜  Local:   http://localhost:5000/',
      type: 'success',
      timestamp: new Date()
    },
    {
      id: '4',
      content: '  ➜  Network: use --host to expose',
      type: 'output',
      timestamp: new Date()
    },
    {
      id: '5',
      content: '✓ WebContainer initialized successfully',
      type: 'success',
      timestamp: new Date()
    },
    {
      id: '6',
      content: '⚡ AI teams are actively monitoring your development environment',
      type: 'output',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new lines are added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
    };
  }, []);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    const commandId = Date.now().toString();
    
    // Add command to terminal
    const newCommandLine: TerminalLine = {
      id: commandId,
      content: `$ ${command}`,
      type: 'command',
      timestamp: new Date()
    };

    setTerminalLines(prev => [...prev, newCommandLine]);
    setCommandHistory(prev => [...prev, command]);
    setCurrentCommand('');
    setHistoryIndex(-1);

    // Clear any existing command timeout
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    
    // Simulate command execution
    commandTimeoutRef.current = setTimeout(() => {
      const outputLines: TerminalLine[] = [];
      
      switch (command.toLowerCase().trim()) {
        case 'npm run dev':
        case 'yarn dev':
          outputLines.push({
            id: `${commandId}-1`,
            content: 'Starting development server...',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-2`,
            content: '✓ Server started successfully',
            type: 'success',
            timestamp: new Date()
          });
          break;
        
        case 'npm install':
        case 'yarn install':
          outputLines.push({
            id: `${commandId}-1`,
            content: 'Installing dependencies...',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-2`,
            content: '✓ Dependencies installed successfully',
            type: 'success',
            timestamp: new Date()
          });
          break;
        
        case 'ls':
        case 'dir':
          if (project?.files) {
            const files = Object.keys(project.files);
            files.forEach((file, index) => {
              outputLines.push({
                id: `${commandId}-${index + 1}`,
                content: file,
                type: 'output',
                timestamp: new Date()
              });
            });
          }
          break;
        
        case 'clear':
          setTerminalLines([]);
          setIsExecuting(false);
          return;
        
        case 'help':
          outputLines.push({
            id: `${commandId}-1`,
            content: 'Available commands:',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-2`,
            content: '  npm run dev    - Start development server',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-3`,
            content: '  npm install    - Install dependencies',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-4`,
            content: '  ls             - List files',
            type: 'output',
            timestamp: new Date()
          });
          outputLines.push({
            id: `${commandId}-5`,
            content: '  clear          - Clear terminal',
            type: 'output',
            timestamp: new Date()
          });
          break;
        
        default:
          if (command.startsWith('echo ')) {
            outputLines.push({
              id: `${commandId}-1`,
              content: command.substring(5),
              type: 'output',
              timestamp: new Date()
            });
          } else {
            outputLines.push({
              id: `${commandId}-1`,
              content: `Command not found: ${command}`,
              type: 'error',
              timestamp: new Date()
            });
            outputLines.push({
              id: `${commandId}-2`,
              content: 'Type "help" for available commands',
              type: 'output',
              timestamp: new Date()
            });
          }
      }

      setTerminalLines(prev => [...prev, ...outputLines]);
      setIsExecuting(false);
    }, 1000);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-white';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'output':
      default:
        return 'text-gray-300';
    }
  };

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'output', label: 'Output', icon: FileText },
    { id: 'ai-chat', label: 'AI Chat', icon: Bot },
    { id: 'debug', label: 'Debug Console', icon: Bug },
  ] as const;

  return (
    <div className="bg-gray-800 border-t border-gray-700 flex flex-col" style={{ height }}>
      {/* Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm pb-1 transition-colors flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={() => onHeightChange(height === 256 ? 400 : 256)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col">
            <div 
              ref={terminalRef}
              className="flex-1 p-3 font-code text-sm overflow-y-auto scrollbar-thin bg-gray-900"
            >
              {terminalLines.map((line) => (
                <div key={line.id} className={`${getLineColor(line.type)} leading-relaxed`}>
                  {line.content}
                </div>
              ))}
              
              {!isExecuting && (
                <form onSubmit={handleCommandSubmit} className="flex items-center mt-2">
                  <span className="text-green-400 mr-2">$</span>
                  <Input
                    ref={commandInputRef}
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none p-0 text-gray-100 focus:outline-none focus:ring-0 font-code"
                    placeholder=""
                    disabled={isExecuting}
                    autoFocus
                  />
                </form>
              )}
              
              {isExecuting && (
                <div className="flex items-center mt-2 text-gray-400">
                  <span className="mr-2">Executing...</span>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="h-full p-3 font-code text-sm overflow-y-auto scrollbar-thin bg-gray-900">
            <div className="text-gray-300">
              <div className="text-blue-400">[Info] Application started successfully</div>
              <div className="text-green-400">[Success] WebContainer ready</div>
              <div className="text-yellow-400">[Warning] Some dependencies may need updates</div>
              <div className="text-gray-400">[Debug] Hot reload enabled</div>
            </div>
          </div>
        )}

        {activeTab === 'ai-chat' && (
          <div className="h-full p-3 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">AI Chat integration coming soon</p>
              <p className="text-xs mt-1">Use the main AI panel on the right sidebar</p>
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="h-full p-3 font-code text-sm overflow-y-auto scrollbar-thin bg-gray-900">
            <div className="text-gray-300">
              <div className="text-blue-400">[Debug] Application initialized</div>
              <div className="text-green-400">[Debug] All AI agents connected</div>
              <div className="text-gray-400">[Debug] WebSocket connection established</div>
              <div className="text-yellow-400">[Debug] Watching for file changes...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
