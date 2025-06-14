import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Play,
  RefreshCw,
  TrendingUp,
  Bug,
  Wrench,
  TestTube,
  Rocket
} from 'lucide-react';
import { useSelfHealing } from '@/hooks/useSelfHealing';

export default function SelfHealingDashboard() {
  const { 
    status, 
    history, 
    triggerHealing, 
    isRunning, 
    lastResult, 
    error,
    refetch 
  } = useSelfHealing();

  const getStatusIcon = (healingStatus: string) => {
    switch (healingStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'issue_detected':
        return <Bug className="h-4 w-4 text-orange-500" />;
      case 'fix_proposed':
        return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'test_failed':
        return <TestTube className="h-4 w-4 text-red-500" />;
      case 'deployed':
        return <Rocket className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (healingStatus: string) => {
    switch (healingStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deployed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'issue_detected':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'fix_proposed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'test_failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Self-Healing System</h2>
          <p className="text-gray-600">Automated error detection and recovery</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={refetch}
            disabled={isRunning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => triggerHealing()}
            disabled={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Healing'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">System Status</p>
                <p className="text-sm font-medium">
                  {isRunning ? 'Running' : 'Ready'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Success Rate</p>
                <p className="text-sm font-medium">
                  {status?.successRate ? `${status.successRate.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500">Total Runs</p>
                <p className="text-sm font-medium">{status?.totalRuns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Last Run</p>
                <p className="text-sm font-medium">
                  {status?.lastRun 
                    ? new Date(status.lastRun).toLocaleTimeString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-600">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Result */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(String(lastResult.status))}
              <span>Latest Healing Result</span>
              <Badge className={getStatusColor(String(lastResult.status))}>
                {String(lastResult.status).replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              Executed in {formatExecutionTime(lastResult.executionTime)} at{' '}
              {new Date(lastResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastResult.details && (
              <div className="space-y-4">
                {lastResult.details.issue && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Detected Issue</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {lastResult.details.issue.type}: {lastResult.details.issue.message}
                    </p>
                  </div>
                )}

                {lastResult.details.rootCause && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Root Cause Analysis</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {lastResult.details.rootCause.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Confidence: {(lastResult.details.rootCause.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )}

                {lastResult.details.fix && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Proposed Fix</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {lastResult.details.fix.description}
                    </p>
                    <div className="mt-2 flex space-x-4">
                      <Badge variant="outline">
                        Risk: {lastResult.details.fix.riskLevel}
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {(lastResult.details.fix.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                )}

                {lastResult.details.testResult && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Test Results</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Test Score</span>
                        <span className="text-sm font-medium">
                          {lastResult.details.testResult.score.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={lastResult.details.testResult.score} className="h-2" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="all">All History</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Healing Activities</CardTitle>
              <CardDescription>
                Last 10 self-healing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status?.recentResults && status.recentResults.length > 0 ? (
                <div className="space-y-2">
                  {status.recentResults.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="text-sm font-medium">{result.status.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatExecutionTime(result.executionTime)}</p>
                        <Badge 
                          variant="outline" 
                          className={result.success ? 'text-green-600' : 'text-red-600'}
                        >
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent healing activities
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete History</CardTitle>
              <CardDescription>
                All self-healing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="text-sm font-medium">{result.status.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatExecutionTime(result.executionTime)}</p>
                        <Badge 
                          variant="outline" 
                          className={result.success ? 'text-green-600' : 'text-red-600'}
                        >
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No healing history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}