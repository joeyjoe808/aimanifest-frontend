import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, File, Code, FileText, Image, Settings, FolderOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileExplorerProps {
  projectId: string | number;
  onFileSelect: (file: string) => void;
  className?: string;
}

interface ProjectFile {
  name: string;
  type: 'file' | 'folder';
  extension?: string;
}

export default function FileExplorer({ projectId, onFileSelect, className = '' }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['components', 'utils']));

  const { data: fileData, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}/files`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'css':
      case 'scss':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'html':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'json':
        return <Settings className="w-4 h-4 text-yellow-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'svg':
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const organizeFiles = (files: string[]) => {
    const organized: { [key: string]: ProjectFile[] } = {
      root: [],
      components: [],
      utils: []
    };

    files.forEach(file => {
      if (file.includes('/')) {
        const [folder, ...rest] = file.split('/');
        const fileName = rest.join('/');
        
        if (!organized[folder]) {
          organized[folder] = [];
        }
        organized[folder].push({
          name: fileName,
          type: 'file',
          extension: fileName.split('.').pop()
        });
      } else {
        organized.root.push({
          name: file,
          type: 'file',
          extension: file.split('.').pop()
        });
      }
    });

    return organized;
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-sm text-gray-500">Loading project files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-sm text-red-500">Failed to load files</div>
      </div>
    );
  }

  const files = (fileData as { files: string[] })?.files || [];
  const organizedFiles = organizeFiles(files);

  return (
    <div className={`${className}`}>
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Project Files</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Root files */}
          {organizedFiles.root.map((file, i) => (
            <div
              key={`root-${i}`}
              onClick={() => onFileSelect(file.name)}
              className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm group"
            >
              {getFileIcon(file.name)}
              <span className="ml-2 truncate">{file.name}</span>
            </div>
          ))}

          {/* Folders */}
          {Object.entries(organizedFiles).map(([folderName, folderFiles]) => {
            if (folderName === 'root' || folderFiles.length === 0) return null;
            
            const isExpanded = expandedFolders.has(folderName);
            
            return (
              <div key={folderName} className="mt-1">
                <div
                  onClick={() => toggleFolder(folderName)}
                  className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm"
                >
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="ml-2 font-medium">{folderName}</span>
                </div>
                
                {isExpanded && (
                  <div className="ml-4 border-l border-gray-200">
                    {folderFiles.map((file, i) => (
                      <div
                        key={`${folderName}-${i}`}
                        onClick={() => onFileSelect(`${folderName}/${file.name}`)}
                        className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm group"
                      >
                        {getFileIcon(file.name)}
                        <span className="ml-2 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}