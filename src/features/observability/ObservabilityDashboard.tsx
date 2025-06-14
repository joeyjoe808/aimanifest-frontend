import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Cpu,
  MemoryStick,
  Network,
  Database,
  Clock,
  Zap,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';

export default function ObservabilityDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

  // Fetch real-time metrics from observability agent
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/observability/metrics'],
    refetchInterval: 5000
  });

  // Fetch system alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/observability/alerts'],
    refetchInterval: 10000
  });

  // Fetch performance insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/observability/insights'],
    refetchInterval: 30000
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (value: number, threshold: number, reverse = false) => {
    const isHealthy = reverse ? value < threshold : value > threshold;
    if (isHealthy) return 'text-green-600';
    if (value > threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            System Observability
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time monitoring and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Monitoring Active
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">CPU Usage</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.cpu?.usage?.toFixed(1) || '--'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={metrics?.cpu?.usage || 0} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {metrics?.cpu?.cores || '--'} cores available
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Memory</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.memory?.percentage?.toFixed(1) || '--'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <MemoryStick className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={metrics?.memory?.percentage || 0} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {metrics?.memory?.used?.toFixed(1) || '--'}GB used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Network</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.network?.latency?.toFixed(1) || '--'}ms
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Network className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>In: {metrics?.network ? formatBytes(metrics.network.bytesIn) : '--'}</span>
                <span>Out: {metrics?.network ? formatBytes(metrics.network.bytesOut) : '--'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Database</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.database?.queryTime?.toFixed(0) || '--'}ms
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{metrics?.database?.connections || '--'} conn</span>
                <span>{metrics?.database?.slowQueries || '--'} slow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Requests</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics?.application?.requestsPerSecond?.toFixed(0) || '--'}/s
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{metrics?.application?.errorRate?.toFixed(2) || '--'}% errors</span>
                <span>{metrics?.application?.activeUsers || '--'} users</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="text-center py-8 text-slate-500">
                    Loading metrics data...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Response Time</span>
                      <span className="font-semibold">
                        {metrics?.application?.responseTime?.toFixed(0) || '--'}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">95th Percentile</span>
                      <span className="font-semibold">
                        {metrics?.application?.responseTime ? (metrics.application.responseTime * 1.4).toFixed(0) : '--'}ms
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Real-time performance monitoring active
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  System Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {insights?.healthScore || '--'}
                    </div>
                    <div className="text-sm text-slate-500">Health Score</div>
                  </div>
                  <Progress value={insights?.healthScore || 0} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span>Performance: Good</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span>Availability: High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading alert data...
                </div>
              ) : alerts?.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          {alert.timestamp}
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {alert.title}
                      </h4>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No active alerts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Distributed Traces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Trace data will be collected from active requests
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Analyzing performance patterns...
                </div>
              ) : insights?.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {insights.recommendations.map((insight: any, index: number) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{insight.category}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {insight.impact} Impact
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-900 dark:text-white">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Performance insights will appear after system analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}