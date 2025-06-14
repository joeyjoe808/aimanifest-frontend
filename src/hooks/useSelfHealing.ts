import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface HealingResult {
  success: boolean;
  status: 'healthy' | 'issue_detected' | 'fix_proposed' | 'test_failed' | 'deployed' | 'failed';
  executionTime: number;
  timestamp: string;
  details?: {
    issue?: any;
    rootCause?: any;
    fix?: any;
    testResult?: any;
    deployResult?: any;
  };
}

interface SelfHealingStatus {
  isRunning: boolean;
  lastRun: string | null;
  totalRuns: number;
  successRate: number;
  recentResults: HealingResult[];
}

export function useSelfHealing() {
  const [lastResult, setLastResult] = useState<HealingResult | null>(null);

  // Query for current status
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/self-heal/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Query for healing history
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/self-heal/history'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to trigger self-healing
  const healingMutation = useMutation({
    mutationFn: async (projectId: string = 'default') => {
      const response = await apiRequest('POST', '/api/self-heal/trigger', { projectId });
      return response.json();
    },
    onSuccess: (data) => {
      setLastResult(data.result as HealingResult);
      refetchStatus();
      refetchHistory();
    },
    onError: (error) => {
      console.error('Self-healing failed:', error);
    },
  });

  const triggerHealing = (projectId?: string) => {
    healingMutation.mutate(projectId);
  };

  return {
    // Status
    status: status as SelfHealingStatus | undefined,
    isRunning: (status as any)?.isRunning || healingMutation.isPending,
    
    // History
    history: (historyData as any)?.history || [],
    
    // Actions
    triggerHealing,
    
    // Results
    lastResult: lastResult || healingMutation.data,
    
    // States
    isLoading: healingMutation.isPending,
    error: healingMutation.error,
    
    // Utils
    refetch: () => {
      refetchStatus();
      refetchHistory();
    }
  };
}