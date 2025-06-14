import { useQuery } from '@tanstack/react-query';

interface SystemAgent {
  name: string;
  status: 'active' | 'idle' | 'error';
  load: number;
}

interface SystemDiagnostics {
  performance: number;
  memory: string;
  agents: SystemAgent[];
  uptime: string;
  wsConnections: number;
  timestamp: string;
}

export function useSystemDiagnostics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/system/checks'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  const diagnostics = data as SystemDiagnostics | undefined;

  return {
    diagnostics,
    isLoading,
    error,
    isHealthy: diagnostics ? diagnostics.performance > 80 : false
  };
}