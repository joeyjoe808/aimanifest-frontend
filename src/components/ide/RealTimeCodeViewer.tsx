import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Play, Pause, RotateCcw, FileText, Zap, CheckCircle } from 'lucide-react';

interface CodeLine {
  id: string;
  content: string;
  lineNumber: number;
  timestamp: Date;
  type: 'function' | 'import' | 'variable' | 'comment' | 'jsx' | 'css';
  file: string;
}

interface FileProgress {
  name: string;
  totalLines: number;
  currentLines: number;
  status: 'pending' | 'writing' | 'complete';
}

export default function RealTimeCodeViewer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeLines, setCodeLines] = useState<CodeLine[]>([]);
  const [currentFile, setCurrentFile] = useState('App.tsx');
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [generationSpeed, setGenerationSpeed] = useState(1);
  const [totalLinesGenerated, setTotalLinesGenerated] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mockCodeTemplates = {
    'App.tsx': [
      { content: "import React from 'react';", type: 'import' as const },
      { content: "import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';", type: 'import' as const },
      { content: "import Header from './components/Header';", type: 'import' as const },
      { content: "import Home from './pages/Home';", type: 'import' as const },
      { content: "import About from './pages/About';", type: 'import' as const },
      { content: "", type: 'comment' as const },
      { content: "function App() {", type: 'function' as const },
      { content: "  return (", type: 'jsx' as const },
      { content: "    <Router>", type: 'jsx' as const },
      { content: "      <div className=\"min-h-screen bg-gray-50\">", type: 'jsx' as const },
      { content: "        <Header />", type: 'jsx' as const },
      { content: "        <main className=\"container mx-auto px-4 py-8\">", type: 'jsx' as const },
      { content: "          <Routes>", type: 'jsx' as const },
      { content: "            <Route path=\"/\" element={<Home />} />", type: 'jsx' as const },
      { content: "            <Route path=\"/about\" element={<About />} />", type: 'jsx' as const },
      { content: "          </Routes>", type: 'jsx' as const },
      { content: "        </main>", type: 'jsx' as const },
      { content: "      </div>", type: 'jsx' as const },
      { content: "    </Router>", type: 'jsx' as const },
      { content: "  );", type: 'jsx' as const },
      { content: "}", type: 'function' as const },
      { content: "", type: 'comment' as const },
      { content: "export default App;", type: 'import' as const }
    ],
    'components/Header.tsx': [
      { content: "import React from 'react';", type: 'import' as const },
      { content: "import { Link } from 'react-router-dom';", type: 'import' as const },
      { content: "", type: 'comment' as const },
      { content: "const Header: React.FC = () => {", type: 'function' as const },
      { content: "  return (", type: 'jsx' as const },
      { content: "    <header className=\"bg-white shadow-sm border-b\">", type: 'jsx' as const },
      { content: "      <div className=\"container mx-auto px-4\">", type: 'jsx' as const },
      { content: "        <div className=\"flex items-center justify-between h-16\">", type: 'jsx' as const },
      { content: "          <Link to=\"/\" className=\"text-xl font-bold text-gray-900\">", type: 'jsx' as const },
      { content: "            MyApp", type: 'jsx' as const },
      { content: "          </Link>", type: 'jsx' as const },
      { content: "          <nav className=\"flex items-center space-x-8\">", type: 'jsx' as const },
      { content: "            <Link to=\"/\" className=\"text-gray-600 hover:text-gray-900\">", type: 'jsx' as const },
      { content: "              Home", type: 'jsx' as const },
      { content: "            </Link>", type: 'jsx' as const },
      { content: "            <Link to=\"/about\" className=\"text-gray-600 hover:text-gray-900\">", type: 'jsx' as const },
      { content: "              About", type: 'jsx' as const },
      { content: "            </Link>", type: 'jsx' as const },
      { content: "          </nav>", type: 'jsx' as const },
      { content: "        </div>", type: 'jsx' as const },
      { content: "      </div>", type: 'jsx' as const },
      { content: "    </header>", type: 'jsx' as const },
      { content: "  );", type: 'jsx' as const },
      { content: "};", type: 'function' as const },
      { content: "", type: 'comment' as const },
      { content: "export default Header;", type: 'import' as const }
    ],
    'pages/Home.tsx': [
      { content: "import React, { useState, useEffect } from 'react';", type: 'import' as const },
      { content: "", type: 'comment' as const },
      { content: "const Home: React.FC = () => {", type: 'function' as const },
      { content: "  const [loading, setLoading] = useState(true);", type: 'variable' as const },
      { content: "  const [data, setData] = useState<Array<DataItem>>([]);", type: 'variable' as const },
      { content: "", type: 'comment' as const },
      { content: "  useEffect(() => {", type: 'function' as const },
      { content: "    // Simulate data loading", type: 'comment' as const },
      { content: "    setTimeout(() => {", type: 'function' as const },
      { content: "      setData([", type: 'variable' as const },
      { content: "        { id: 1, title: 'Welcome to MyApp', description: 'This is a sample item' },", type: 'variable' as const },
      { content: "        { id: 2, title: 'Getting Started', description: 'Learn how to use our features' },", type: 'variable' as const },
      { content: "        { id: 3, title: 'Advanced Features', description: 'Explore powerful capabilities' }", type: 'variable' as const },
      { content: "      ]);", type: 'variable' as const },
      { content: "      setLoading(false);", type: 'variable' as const },
      { content: "    }, 2000);", type: 'function' as const },
      { content: "  }, []);", type: 'function' as const },
      { content: "", type: 'comment' as const },
      { content: "  if (loading) {", type: 'jsx' as const },
      { content: "    return (", type: 'jsx' as const },
      { content: "      <div className=\"flex items-center justify-center h-64\">", type: 'jsx' as const },
      { content: "        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>", type: 'jsx' as const },
      { content: "      </div>", type: 'jsx' as const },
      { content: "    );", type: 'jsx' as const },
      { content: "  }", type: 'jsx' as const },
      { content: "", type: 'comment' as const },
      { content: "  return (", type: 'jsx' as const },
      { content: "    <div className=\"space-y-8\">", type: 'jsx' as const },
      { content: "      <div className=\"text-center\">", type: 'jsx' as const },
      { content: "        <h1 className=\"text-4xl font-bold text-gray-900 mb-4\">", type: 'jsx' as const },
      { content: "          Welcome to MyApp", type: 'jsx' as const },
      { content: "        </h1>", type: 'jsx' as const },
      { content: "        <p className=\"text-xl text-gray-600\">", type: 'jsx' as const },
      { content: "          Your journey starts here", type: 'jsx' as const },
      { content: "        </p>", type: 'jsx' as const },
      { content: "      </div>", type: 'jsx' as const },
      { content: "      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">", type: 'jsx' as const },
      { content: "        {data.map((item) => (", type: 'jsx' as const },
      { content: "          <div key={item.id} className=\"bg-white p-6 rounded-lg shadow-sm border\">", type: 'jsx' as const },
      { content: "            <h3 className=\"text-lg font-semibold mb-2\">{item.title}</h3>", type: 'jsx' as const },
      { content: "            <p className=\"text-gray-600\">{item.description}</p>", type: 'jsx' as const },
      { content: "          </div>", type: 'jsx' as const },
      { content: "        ))}", type: 'jsx' as const },
      { content: "      </div>", type: 'jsx' as const },
      { content: "    </div>", type: 'jsx' as const },
      { content: "  );", type: 'jsx' as const },
      { content: "};", type: 'function' as const },
      { content: "", type: 'comment' as const },
      { content: "export default Home;", type: 'import' as const }
    ],
    'styles/globals.css': [
      { content: "@import 'tailwindcss/base';", type: 'css' as const },
      { content: "@import 'tailwindcss/components';", type: 'css' as const },
      { content: "@import 'tailwindcss/utilities';", type: 'css' as const },
      { content: "", type: 'css' as const },
      { content: "/* Custom styles */", type: 'comment' as const },
      { content: "body {", type: 'css' as const },
      { content: "  font-family: 'Inter', sans-serif;", type: 'css' as const },
      { content: "  line-height: 1.6;", type: 'css' as const },
      { content: "}", type: 'css' as const },
      { content: "", type: 'css' as const },
      { content: ".container {", type: 'css' as const },
      { content: "  max-width: 1200px;", type: 'css' as const },
      { content: "}", type: 'css' as const },
      { content: "", type: 'css' as const },
      { content: ".animate-pulse {", type: 'css' as const },
      { content: "  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;", type: 'css' as const },
      { content: "}", type: 'css' as const }
    ]
  };

  const initializeFileProgress = () => {
    const files = Object.keys(mockCodeTemplates);
    const progress = files.map(file => ({
      name: file,
      totalLines: mockCodeTemplates[file as keyof typeof mockCodeTemplates].length,
      currentLines: 0,
      status: 'pending' as const
    }));
    setFileProgress(progress);
  };

  const startGeneration = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsGenerating(true);
    setCodeLines([]);
    setTotalLinesGenerated(0);
    initializeFileProgress();
    
    const files = Object.keys(mockCodeTemplates);
    let currentFileIndex = 0;
    let currentLineIndex = 0;

    const generateNextLine = () => {
      // Check if generation should stop
      if (!isGenerating || currentFileIndex >= files.length) {
        setIsGenerating(false);
        setFileProgress(prev => prev.map(f => ({ ...f, status: 'complete' })));
        return;
      }

      const fileName = files[currentFileIndex];
      const template = mockCodeTemplates[fileName as keyof typeof mockCodeTemplates];

      if (currentLineIndex >= template.length) {
        setFileProgress(prev => prev.map(f => 
          f.name === fileName ? { ...f, status: 'complete' } : f
        ));
        currentFileIndex++;
        currentLineIndex = 0;
        if (currentFileIndex < files.length) {
          setCurrentFile(files[currentFileIndex]);
          setFileProgress(prev => prev.map(f => 
            f.name === files[currentFileIndex] ? { ...f, status: 'writing' } : f
          ));
        }
        timeoutRef.current = setTimeout(generateNextLine, Math.max(100, 300 / generationSpeed));
        return;
      }

      if (currentLineIndex === 0) {
        setCurrentFile(fileName);
        setFileProgress(prev => prev.map(f => 
          f.name === fileName ? { ...f, status: 'writing' } : f
        ));
      }

      const line = template[currentLineIndex];
      const newCodeLine: CodeLine = {
        id: `${fileName}-${currentLineIndex}-${Date.now()}`,
        content: line.content,
        lineNumber: currentLineIndex + 1,
        timestamp: new Date(),
        type: line.type,
        file: fileName
      };

      setCodeLines(prev => [...prev, newCodeLine]);
      setTotalLinesGenerated(prev => prev + 1);
      setFileProgress(prev => prev.map(f => 
        f.name === fileName ? { ...f, currentLines: currentLineIndex + 1 } : f
      ));

      currentLineIndex++;
      timeoutRef.current = setTimeout(generateNextLine, Math.max(50, Math.random() * 200 + 100 / generationSpeed));
    };

    generateNextLine();
  };

  const pauseGeneration = () => {
    setIsGenerating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetGeneration = () => {
    setIsGenerating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCodeLines([]);
    setTotalLinesGenerated(0);
    setCurrentFile('App.tsx');
    initializeFileProgress();
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [codeLines]);

  useEffect(() => {
    initializeFileProgress();
  }, []);

  const getTypeColor = (type: CodeLine['type']) => {
    switch (type) {
      case 'import': return 'text-purple-600';
      case 'function': return 'text-blue-600';
      case 'variable': return 'text-green-600';
      case 'jsx': return 'text-orange-600';
      case 'css': return 'text-pink-600';
      case 'comment': return 'text-gray-500';
      default: return 'text-gray-800';
    }
  };

  const getTypeIcon = (type: CodeLine['type']) => {
    switch (type) {
      case 'function': return '⚡';
      case 'import': return '📦';
      case 'variable': return '💠';
      case 'jsx': return '🧩';
      case 'css': return '🎨';
      case 'comment': return '💭';
      default: return '📝';
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Real-Time Code Generation</h3>
          <Badge variant="outline" className="text-blue-600">Live Coding</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Speed:</span>
            <select 
              value={generationSpeed} 
              onChange={(e) => setGenerationSpeed(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={0.5}>Slow</option>
              <option value={1}>Normal</option>
              <option value={2}>Fast</option>
              <option value={4}>Very Fast</option>
            </select>
          </div>
          <Button 
            onClick={isGenerating ? pauseGeneration : startGeneration} 
            disabled={false}
            className="flex items-center gap-2"
          >
            {isGenerating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isGenerating ? 'Pause' : 'Start Generation'}
          </Button>
          <Button 
            onClick={resetGeneration} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* File Progress Panel */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File Progress
          </h4>
          <div className="space-y-2">
            {fileProgress.map(file => (
              <Card key={file.name} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <Badge 
                    variant={file.status === 'complete' ? 'default' : file.status === 'writing' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {file.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {file.status === 'writing' && <Zap className="h-3 w-3 mr-1" />}
                    {file.status}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      file.status === 'complete' ? 'bg-green-500' : 
                      file.status === 'writing' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    style={{ width: `${(file.currentLines / file.totalLines) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {file.currentLines} / {file.totalLines} lines
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="p-3 border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLinesGenerated}</div>
              <div className="text-sm text-blue-600">Total Lines Generated</div>
            </div>
          </Card>
        </div>

        {/* Live Code Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Current File: {currentFile}</h4>
            {isGenerating && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Writing code...</span>
              </div>
            )}
          </div>
          
          <Card className="h-96 bg-gray-900 text-green-400 font-mono text-sm">
            <CardContent className="p-4 h-full">
              <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                {codeLines.filter(line => line.file === currentFile).map((line, index) => (
                  <div 
                    key={line.id} 
                    className="flex items-start gap-3 py-1 hover:bg-gray-800 transition-colors animate-in slide-in-from-left duration-300"
                  >
                    <span className="text-gray-500 w-8 text-right text-xs">
                      {line.lineNumber}
                    </span>
                    <span className="text-xs">{getTypeIcon(line.type)}</span>
                    <span className={`flex-1 ${getTypeColor(line.type)}`}>
                      {line.content || ' '}
                    </span>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-gray-500 w-8"></span>
                    <div className="w-2 h-4 bg-green-400 animate-pulse"></div>
                    <span className="text-gray-400">█</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}