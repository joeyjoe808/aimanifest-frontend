import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Paperclip, X } from 'lucide-react';
import { GenerateAppButton, ViewProjectsButton } from '@/components/ui/smart-button';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateSuccess = (result: any) => {
    console.log('AI Agent Response:', result);
    // Store prompt and navigate to workspace
    localStorage.setItem('currentPrompt', prompt.trim());
    if (result.projectId) {
      localStorage.setItem('currentProjectId', result.projectId.toString());
    }
    setLocation('/workspace');
  };

  const handleViewProjectsSuccess = (projects: any) => {
    // Store projects data for dashboard
    localStorage.setItem('userProjects', JSON.stringify(projects));
    // Navigate to dashboard
    setLocation('/dashboard/projects');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-white px-8 bg-[#0e1525]">
      {/* Top Bar */}
      <div className="flex justify-between py-6 text-sm font-semibold">
        <div>DEV SOFT.AI</div>
        <div className="space-x-6">
          <a href="/dashboard" className="hover:underline hover:text-blue-400 transition">Platform Overview</a>
          <a href="/learning" className="hover:underline hover:text-blue-400 transition">Learning Center</a>
          <a href="/ide" className="hover:underline hover:text-blue-400 transition">IDE</a>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto flex flex-col justify-center py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Build Applications with AI
          </h1>
          <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Describe your app idea in natural language and watch our AI agents collaborate to build, design, and deploy your application in real-time.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
          <div className="space-y-4">
            {/* Main Prompt Input */}
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the app you want to build (e.g., 'Build a task management app with drag & drop', 'Create a weather dashboard with charts', 'Make an e-commerce store with cart functionality')"
                className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-400 mt-2">
                Be specific about features, styling, and functionality for best results
              </div>
            </div>

            {/* File Attachment Section */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm font-medium"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach Files
                </button>
              </div>
              
              {/* File List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-xs font-medium">
                          {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv,.zip"
              />
              
              <div className="text-xs text-gray-500 mt-2">
                Supported: Images, PDFs, Documents, Text files, JSON, CSV, ZIP (Max 10MB each)
              </div>
            </div>
            
            {/* Smart Buttons */}
            <div className="flex justify-between items-center mt-4">
              <ViewProjectsButton 
                onSuccess={handleViewProjectsSuccess}
              />
              
              <GenerateAppButton
                prompt={prompt}
                files={attachedFiles}
                onSuccess={handleGenerateSuccess}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Preview */}
      <div className="py-12 border-t border-gray-800 bg-[#0e1525]">
        <h2 className="text-xl font-light text-center mb-8 text-gray-300">DEV AI Software Engineer</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-medium mb-2">Master AI Console</h3>
            <p className="text-sm text-gray-400">AI agents coordinate to build applications from natural language descriptions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-medium mb-2">Learning Center</h3>
            <p className="text-sm text-gray-400">Gamified tutorials with XP tracking and achievement badges</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-medium mb-2">Live Preview</h3>
            <p className="text-sm text-gray-400">Real-time code generation with instant visual feedback</p>
          </div>
        </div>
        
        {/* Quick Start Guide */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-light text-center mb-6 text-gray-300">Get Started in 30 Seconds</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-lg mb-2">1️⃣</div>
              <p className="text-gray-300">Describe your app above</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-lg mb-2">2️⃣</div>
              <p className="text-gray-300">Watch AI agents coordinate</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-lg mb-2">3️⃣</div>
              <p className="text-gray-300">See live preview generated</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-lg mb-2">4️⃣</div>
              <p className="text-gray-300">Deploy or iterate further</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-500">
        <a href="/privacy" className="hover:underline mr-4">Privacy</a>
        <a href="/terms" className="hover:underline">Terms</a>
      </footer>
    </div>
  );
}