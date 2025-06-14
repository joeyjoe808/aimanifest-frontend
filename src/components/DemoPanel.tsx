import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SmartButton } from './SmartButton';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BuildProgress {
  buildId: string;
  status: string;
  progress: number;
  currentStep: string;
}

export default function DemoPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
  const [docsUrl, setDocsUrl] = useState<string>('');
  const { toast } = useToast();

  // Fetch Users mutation
  const fetchUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/demo/fetch-users');
      return response.json();
    },
    onSuccess: (data) => {
      setUsers(data.data.users);
      toast({
        title: "Success",
        description: `Fetched ${data.data.totalCount} users`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  });

  // Start Build mutation
  const startBuildMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/demo/start-build', {
        projectId: 1,
        buildType: 'production'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setBuildProgress({
        buildId: data.data.buildId,
        status: data.data.status,
        progress: 0,
        currentStep: 'Starting build...'
      });
      toast({
        title: "Build Started",
        description: `Build ${data.data.buildId} initiated`
      });
    },
    onError: (error) => {
      toast({
        title: "Build Failed",
        description: "Unable to start build process",
        variant: "destructive"
      });
    }
  });

  // Open Docs mutation
  const openDocsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/demo/open-docs?section=getting-started');
      return response.json();
    },
    onSuccess: (data) => {
      setDocsUrl(data.data.url);
      window.open(data.data.url, '_blank');
      toast({
        title: "Documentation Opened",
        description: data.data.title
      });
    },
    onError: (error) => {
      toast({
        title: "Documentation Error",
        description: "Cannot access documentation",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demo Panel</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Auto-generated from manifest
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fetch Users Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">User Management</h3>
          <SmartButton
            actionId="fetchUsers"
            label="Fetch Users"
            variant="default"
            onClick={async () => fetchUsersMutation.mutate()}
            className="w-full mb-3"
          />
          {users.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Loaded {users.length} users
            </div>
          )}
        </div>

        {/* Build Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Build Operations</h3>
          <SmartButton
            actionId="startBuild"
            label="Start Build"
            variant="default"
            onClick={async () => startBuildMutation.mutate()}
            className="w-full mb-3"
          />
          {buildProgress && (
            <div className="text-sm space-y-1">
              <div className="text-gray-600 dark:text-gray-300">
                Status: {buildProgress.status}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Build ID: {buildProgress.buildId}
              </div>
            </div>
          )}
        </div>

        {/* Documentation Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Documentation</h3>
          <SmartButton
            actionId="openDocs"
            label="Open Docs"
            variant="outline"
            onClick={async () => openDocsMutation.mutate()}
            className="w-full mb-3"
          />
          {docsUrl && (
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Last opened: {docsUrl}
            </div>
          )}
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">System Status</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-300">Users Loaded:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{users.length}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Build Status:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {buildProgress?.status || 'Ready'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-300">Docs:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {docsUrl ? 'Available' : 'Not loaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}