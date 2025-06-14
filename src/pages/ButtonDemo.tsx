import { useState } from 'react';
import {
  GenerateAppButton,
  ViewProjectsButton,
  SaveProjectButton,
  DeployAppButton,
  DownloadSourceCodeButton,
  CloneProjectButton,
  InviteCollaboratorButton,
  LaunchAppPreviewButton,
  RunAIAgentButton,
  ChatAIButton
} from '@/components/ui/smart-button';

export default function ButtonDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentProject] = useState({ id: 123, name: 'Demo Project' });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSuccess = (action: string, data: any) => {
    addLog(`✅ ${action} completed successfully`);
    console.log(`${action} result:`, data);
  };

  const handleError = (action: string, error: string) => {
    addLog(`❌ ${action} failed: ${error}`);
    console.error(`${action} error:`, error);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Smart Button Auto-Linking System</h1>
        <p className="text-gray-600 text-lg">
          Complete demonstration of specialized buttons with backend API integration
        </p>
      </div>

      {/* Core Workflow Buttons */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Core Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GenerateAppButton
            prompt="Build a task management dashboard with real-time updates"
            files={[]}
            onSuccess={(data) => handleSuccess('App Generation', data)}
            onError={(error) => handleError('App Generation', error)}
          />
          <ViewProjectsButton
            onSuccess={(data) => handleSuccess('View Projects', data)}
            onError={(error) => handleError('View Projects', error)}
          />
        </div>
      </section>

      {/* Project Management */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Project Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SaveProjectButton
            projectId={currentProject.id}
            files={{ 'index.html': '<h1>Demo</h1>' }}
            name={currentProject.name}
            description="Demo project for testing"
            onSuccess={(data) => handleSuccess('Save Project', data)}
            onError={(error) => handleError('Save Project', error)}
          />
          <CloneProjectButton
            projectId={currentProject.id}
            onSuccess={(data) => handleSuccess('Clone Project', data)}
            onError={(error) => handleError('Clone Project', error)}
          />
        </div>
      </section>

      {/* Deployment & Export */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-purple-600">Deployment & Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeployAppButton
            projectId={currentProject.id}
            config={{ environment: 'production' }}
            onSuccess={(data) => handleSuccess('Deploy App', data)}
            onError={(error) => handleError('Deploy App', error)}
          />
          <DownloadSourceCodeButton
            projectId={currentProject.id}
            onSuccess={(data) => handleSuccess('Download Source', data)}
            onError={(error) => handleError('Download Source', error)}
          />
        </div>
      </section>

      {/* Collaboration */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-orange-600">Collaboration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InviteCollaboratorButton
            projectId={currentProject.id}
            onSuccess={(data) => handleSuccess('Invite Collaborator', data)}
            onError={(error) => handleError('Invite Collaborator', error)}
          />
          <LaunchAppPreviewButton
            projectId={currentProject.id}
            onSuccess={(data) => handleSuccess('Launch Preview', data)}
            onError={(error) => handleError('Launch Preview', error)}
          />
        </div>
      </section>

      {/* AI Integration */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">AI Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RunAIAgentButton
            projectId={currentProject.id}
            agentType="frontend-specialist"
            context={{ feature: "add-dark-mode" }}
            onSuccess={(data) => handleSuccess('Run AI Agent', data)}
            onError={(error) => handleError('Run AI Agent', error)}
          />
          <ChatAIButton
            projectId={currentProject.id}
            content="Add responsive navigation menu"
            messageType="feature-request"
            onSuccess={(data) => handleSuccess('Chat AI', data)}
            onError={(error) => handleError('Chat AI', error)}
          />
        </div>
      </section>

      {/* Activity Log */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Click any button above to see real-time activity...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
        <button
          onClick={() => setLogs([])}
          className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
        >
          Clear Log
        </button>
      </section>

      {/* API Routes Reference */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">API Routes Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-blue-600">POST /api/ai/master-agent</code>
            <p className="text-gray-600 mt-1">Generate apps from prompts</p>
          </div>
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-green-600">GET /api/projects</code>
            <p className="text-gray-600 mt-1">List user projects</p>
          </div>
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-purple-600">POST /api/deploy</code>
            <p className="text-gray-600 mt-1">Deploy applications</p>
          </div>
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-orange-600">GET /api/export</code>
            <p className="text-gray-600 mt-1">Download source code</p>
          </div>
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-red-600">POST /api/project/clone</code>
            <p className="text-gray-600 mt-1">Clone projects</p>
          </div>
          <div className="bg-white p-3 rounded">
            <code className="font-bold text-indigo-600">POST /api/team/invite</code>
            <p className="text-gray-600 mt-1">Invite collaborators</p>
          </div>
        </div>
      </section>
    </div>
  );
}