import { useEffect, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import type { EditorTab } from '@/types/ide';

interface CodeEditorProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
}

export default function CodeEditor({ 
  tabs, 
  activeTab, 
  onTabSelect, 
  onTabClose, 
  onContentChange 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const loadMonaco = async () => {
      try {
        // Dynamically import Monaco Editor
        const monaco = await import('monaco-editor');
        monacoRef.current = monaco;

        // Configure Monaco
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
        });

        // Define custom theme
        monaco.editor.defineTheme('vs-dark-custom', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '6A9955' },
            { token: 'keyword', foreground: '569CD6' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'function', foreground: 'DCDCAA' },
            { token: 'variable', foreground: '9CDCFE' },
            { token: 'type', foreground: '4EC9B0' }
          ],
          colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#CCCCCC',
            'editor.lineHighlightBackground': '#2D2D30',
            'editor.selectionBackground': '#264F78',
            'editorLineNumber.foreground': '#858585',
            'editorLineNumber.activeForeground': '#CCCCCC',
          }
        });

        if (editorRef.current) {
          const editorInstance = monaco.editor.create(editorRef.current, {
            value: '',
            language: 'typescript',
            theme: 'vs-dark-custom',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            lineHeight: 1.5,
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            fontLigatures: true,
          });

          editorInstance.onDidChangeModelContent(() => {
            if (activeTab) {
              const content = editorInstance.getValue();
              onContentChange(activeTab, content);
            }
          });

          setEditor(editorInstance);
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    loadMonaco();

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editor && activeTab) {
      const activeTabData = tabs.find(tab => tab.id === activeTab);
      if (activeTabData) {
        const currentValue = editor.getValue();
        if (currentValue !== activeTabData.content) {
          editor.setValue(activeTabData.content);
        }
        
        // Update language
        const model = editor.getModel();
        if (model && monacoRef.current) {
          monacoRef.current.editor.setModelLanguage(model, activeTabData.language);
        }
      }
    }
  }, [editor, activeTab, tabs]);

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const iconColors = {
      tsx: 'text-blue-400',
      jsx: 'text-blue-400',
      ts: 'text-blue-500',
      js: 'text-yellow-500',
      css: 'text-pink-400',
      scss: 'text-pink-500',
      html: 'text-orange-400',
      json: 'text-yellow-600',
      md: 'text-gray-400',
    };

    return (
      <FileText className={`h-4 w-4 ${iconColors[extension as keyof typeof iconColors] || 'text-gray-400'}`} />
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Editor Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {tabs.length > 0 ? (
          <div className="flex">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer transition-colors ${
                  tab.isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => onTabSelect(tab.id)}
              >
                {getFileIcon(tab.filename)}
                <span className="ml-2 text-sm">{tab.filename}</span>
                {tab.isDirty && <span className="ml-1 text-orange-400">•</span>}
                <button
                  className="ml-2 hover:bg-gray-600 w-4 h-4 rounded flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-2 text-gray-500 text-sm">No files open</div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeTab && tabs.find(tab => tab.id === activeTab) ? (
          <div ref={editorRef} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Welcome to AI Engineering Team</p>
              <p className="text-sm">Select a file from the explorer or start a new conversation with AI to begin coding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
