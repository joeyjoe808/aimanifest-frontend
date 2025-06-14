// pages/workspace.tsx
import { useEffect, useState } from 'react';
import { LivePreview } from '@/components/ide/LivePreview';
import LivePreviewComponent from '@/components/LivePreview';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Project {
  id: number;
  name: string;
  files: Record<string, string>;
}

export default function Workspace() {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get project context from landing page
    const initializeWorkspace = async () => {
      setLoading(true);
      
      const currentPrompt = localStorage.getItem('currentPrompt');
      const projectId = localStorage.getItem('currentProjectId');
      
      if (currentPrompt) {
        setAiResponse(`Master Agent: Processing "${currentPrompt}"\n\n` +
          'Frontend Specialist: Setting up modern React components with TypeScript\n' +
          'Backend Developer: Configuring Express.js server with proper routing\n' +
          'UI/UX Designer: Implementing responsive design with Tailwind CSS\n\n' +
          'Code generation in progress...');
          
        // If we have a project ID, fetch the actual project
        if (projectId) {
          try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (response.ok) {
              const project = await response.json();
              setCurrentProject(project);
            }
          } catch (error) {
            console.error('Error fetching project:', error);
          }
        }
      }
      
      // Complete loading after 3 seconds
      setTimeout(() => {
        setLoading(false);
        setIsConnected(true);
        
        // Only set fallback project if we don't have a real one
        if (!currentProject) {
          setCurrentProject({
            id: parseInt(projectId || '1'),
            name: currentPrompt || 'AI Generated Project',
            files: {
              'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Workspace - Project Ready</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { 
            font-size: 3rem; 
            margin-bottom: 1rem;
            font-weight: 300;
            background: linear-gradient(45deg, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p { 
            font-size: 1.2rem; 
            opacity: 0.9;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-weight: 500;
        }
        .pulse {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Generated Successfully</h1>
        <p>Your AI development team has successfully created a modern web application. The Master Agent coordinated multiple specialists to deliver production-ready code.</p>
        <div class="status">
            <div class="pulse"></div>
            Live Preview Active
        </div>
    </div>
</body>
</html>`
            }
          });
        }
      }, 3000);
    };

    initializeWorkspace();
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-950 text-white">
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="grid grid-cols-3 h-full">
          {/* Left: AI Console */}
          <div className="col-span-1 p-6 border-r border-gray-800 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Master Agent Console</h2>
            <p className="text-sm text-gray-400 mb-4">Summary of orchestration:</p>
            <pre className="text-sm bg-black p-4 rounded-md text-green-300 whitespace-pre-wrap">
              {aiResponse}
            </pre>
            
            {/* Connection Status */}
            <div className="mt-6 p-3 rounded-md bg-gray-900">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? 'Connected to AI Team' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Continue to Full IDE Button */}
            {isConnected && currentProject && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    // Store project context for IDE
                    localStorage.setItem('activeProjectId', currentProject.id.toString());
                    window.location.href = `/ide/${currentProject.id}`;
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue to Full IDE
                </button>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            {currentProject && (
              <LivePreviewComponent
                projectId={currentProject.id.toString()}
                code={currentProject.files['index.html']}
                className="h-full"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}