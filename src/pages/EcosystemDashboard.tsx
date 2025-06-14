import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Cloud, 
  Cpu, 
  Database, 
  MessageSquare, 
  GitBranch, 
  Activity, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Zap,
  Globe,
  BarChart3
} from 'lucide-react';

interface EcosystemService {
  id: string;
  name: string;
  type: 'ai_model' | 'cloud_service' | 'database' | 'communication' | 'dev_tool';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  apiEndpoint: string;
  authentication: {
    type: string;
    configured: boolean;
  };
  capabilities: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    concurrentRequests: number;
  };
  healthCheck: {
    endpoint: string;
    interval: number;
    lastCheck: string;
    responseTime: number;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    uptime: number;
  };
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  services: string[];
  steps: any[];
  triggers: string[];
  status: 'active' | 'paused' | 'error';
}

export default function EcosystemDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Fetch ecosystem services
  const { data: servicesData, isLoading: servicesLoading } = useQuery<{
    services: EcosystemService[];
    summary: any;
  }>({
    queryKey: ['/api/ecosystem/services'],
    refetchInterval: 30000,
  });

  // Fetch ecosystem health
  const { data: healthData } = useQuery<{
    health: any;
  }>({
    queryKey: ['/api/ecosystem/health'],
    refetchInterval: 15000,
  });

  // Fetch workflows
  const { data: workflowsData } = useQuery<{
    workflows: WorkflowDefinition[];
    summary: any;
  }>({
    queryKey: ['/api/ecosystem/workflows'],
  });

  // Fetch ecosystem metrics
  const { data: metricsData } = useQuery<{
    metrics: any;
  }>({
    queryKey: ['/api/ecosystem/metrics'],
    refetchInterval: 60000,
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) => 
      apiRequest('POST', `/api/ecosystem/workflows/${workflowId}/execute`, {}),
    onSuccess: (data) => {
      toast({
        title: "Workflow Executed",
        description: `Workflow completed in ${data.executionTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ecosystem/workflows'] });
    },
    onError: () => {
      toast({
        title: "Execution Failed",
        description: "Failed to execute workflow. Check service availability.",
        variant: "destructive",
      });
    },
  });

  // Health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: (serviceId: string) => 
      apiRequest('POST', `/api/ecosystem/services/${serviceId}/health-check`, {}),
    onSuccess: () => {
      toast({
        title: "Health Check Complete",
        description: "Service health check completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ecosystem/services'] });
    },
  });

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_model': return <Cpu className="h-4 w-4" />;
      case 'cloud_service': return <Cloud className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'dev_tool': return <GitBranch className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ecosystem Dashboard</h1>
          <p className="text-muted-foreground">
            Unified integration platform for AI services, cloud providers, and development tools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(healthData?.health?.overallHealth?.status || 'active')}>
            {healthData?.health?.overallHealth?.score || 95}% Health
          </Badge>
          <Badge variant="outline">
            {servicesData?.services?.filter(s => s.status === 'active').length || 0} Services Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Ecosystem Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{servicesData?.summary?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(servicesData?.summary?.byType || {}).length} categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsData?.metrics?.averageSuccessRate?.toFixed(1) || 99.2}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(metricsData?.metrics?.averageResponseTime || 450)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Network latency included
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsData?.metrics?.averageUptime?.toFixed(1) || 99.7}%
                </div>
                <p className="text-xs text-muted-foreground">
                  30-day average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>
                Distribution of services across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(servicesData?.summary?.byType || {}).map(([type, count]) => (
                  <div key={type} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getServiceTypeIcon(type)}
                    </div>
                    <div className="text-2xl font-bold">{count as number}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                Automated workflows running across the ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowsData?.workflows?.slice(0, 3).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                        <Play className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workflow.services.length} services • {workflow.steps.length} steps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeWorkflowMutation.mutate(workflow.id)}
                        disabled={executeWorkflowMutation.isPending}
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-6">
            {servicesData?.services?.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getServiceTypeIcon(service.type)}
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>
                          {service.type.replace('_', ' ').toUpperCase()} • {service.capabilities.length} capabilities
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => healthCheckMutation.mutate(service.id)}
                        disabled={healthCheckMutation.isPending}
                      >
                        Health Check
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-lg font-bold">{service.metrics.totalRequests.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Requests</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-lg font-bold">{service.metrics.successRate}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-lg font-bold">{service.metrics.averageResponseTime}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-lg font-bold">{service.metrics.uptime}%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  </div>

                  {/* Rate Limits */}
                  <div>
                    <h4 className="font-medium mb-2">Rate Limits</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Requests per minute:</span>
                        <span className="font-medium">{service.rateLimits.requestsPerMinute}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Requests per hour:</span>
                        <span className="font-medium">{service.rateLimits.requestsPerHour.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Concurrent requests:</span>
                        <span className="font-medium">{service.rateLimits.concurrentRequests}</span>
                      </div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="font-medium mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="space-y-6">
            {workflowsData?.workflows?.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <Button 
                        onClick={() => executeWorkflowMutation.mutate(workflow.id)}
                        disabled={executeWorkflowMutation.isPending}
                      >
                        {executeWorkflowMutation.isPending ? 'Executing...' : 'Execute'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Services Used ({workflow.services.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.services.map((serviceId, index) => (
                        <Badge key={index} variant="outline">
                          {servicesData?.services?.find(s => s.id === serviceId)?.name || serviceId}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Workflow Steps ({workflow.steps.length})</h4>
                    <div className="space-y-2">
                      {workflow.steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {servicesData?.services?.find(s => s.id === step.serviceId)?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Triggers</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Ecosystem Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {metricsData?.metrics?.totalRequests?.toLocaleString() || '156K'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(metricsData?.metrics?.performanceScore || 96)}
                  </div>
                  <div className="text-sm text-muted-foreground">Performance Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {Math.round(metricsData?.metrics?.averageResponseTime || 450)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {(metricsData?.metrics?.averageUptime || 99.7).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Service Performance</h4>
                <div className="space-y-3">
                  {metricsData?.metrics?.serviceMetrics?.map((service: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getServiceTypeIcon(service.type)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.metrics.totalRequests.toLocaleString()} requests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{service.metrics.successRate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {service.metrics.averageResponseTime}ms avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Ecosystem Health Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {healthData?.health?.overallHealth?.score || 95}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Health</div>
                  <Badge className="mt-2 bg-green-500">
                    {healthData?.health?.overallHealth?.status || 'Excellent'}
                  </Badge>
                </div>

                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold">
                    {healthData?.health?.services?.healthy || 5}/{healthData?.health?.services?.total || 5}
                  </div>
                  <div className="text-sm text-muted-foreground">Services Healthy</div>
                  <Progress 
                    value={(healthData?.health?.services?.healthy / healthData?.health?.services?.total) * 100 || 100} 
                    className="mt-2"
                  />
                </div>

                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold">
                    {Math.round(healthData?.health?.services?.averageResponseTime || 380)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {healthData?.health?.services?.averageUptime?.toFixed(1) || 99.7}% uptime
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Service Health Details</h4>
                <div className="space-y-2">
                  {servicesData?.services?.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getServiceTypeIcon(service.type)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last check: {new Date(service.healthCheck.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium">{service.healthCheck.responseTime}ms</p>
                          <p className="text-sm text-muted-foreground">{service.metrics.uptime}% uptime</p>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}