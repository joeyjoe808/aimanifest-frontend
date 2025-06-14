import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Network, 
  Server, 
  Globe, 
  Activity,
  Zap,
  Shield,
  Database,
  Cloud,
  Monitor,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

interface FederationNode {
  id: string;
  name: string;
  region: string;
  cloud: string;
  status: 'healthy' | 'degraded' | 'failed' | 'maintenance';
  load: number;
  uptime: number;
  lastHeartbeat: string;
  services: number;
  capacity: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    service: string;
    status: string;
    responseTime: number;
    uptime: number;
  }>;
}

export default function FederationDashboard() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCloud, setSelectedCloud] = useState('all');

  // Fetch federation overview
  const { data: federationData } = useQuery<{
    overview: {
      totalNodes: number;
      activeNodes: number;
      totalRegions: number;
      totalWorkloads: number;
      globalLoad: number;
      uptime: number;
    };
    nodes: FederationNode[];
  }>({
    queryKey: ['federation-overview'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/federated/overview');
      if (!response.ok) throw new Error('Failed to fetch federation overview');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch system health
  const { data: healthData } = useQuery<SystemHealth>({
    queryKey: ['federation-health'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json();
    },
    refetchInterval: 15000,
  });

  // Fetch federation metrics
  const { data: metricsData } = useQuery<{
    metrics: {
      system: any;
      network: any;
      application: any;
    };
  }>({
    queryKey: ['federation-metrics'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/health/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch endpoint health
  const { data: endpointsData } = useQuery<{
    endpoints: Array<{
      path: string;
      status: string;
      responseTime: number;
    }>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
      averageResponseTime: number;
    };
  }>({
    queryKey: ['federation-endpoints'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/health/api/endpoints');
      if (!response.ok) throw new Error('Failed to fetch endpoints data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'failed': case 'unhealthy': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCloudIcon = (cloud: string) => {
    switch (cloud.toLowerCase()) {
      case 'aws': return '🟠';
      case 'gcp': return '🔵';
      case 'azure': return '🟦';
      case 'hybrid': return '🌐';
      default: return '☁️';
    }
  };

  // Mock federation data if API not available
  const mockNodes: FederationNode[] = [
    {
      id: 'node-us-east-1',
      name: 'US East Primary',
      region: 'us-east-1',
      cloud: 'AWS',
      status: 'healthy',
      load: 65,
      uptime: 99.9,
      lastHeartbeat: new Date(Date.now() - 30000).toISOString(),
      services: 12,
      capacity: { cpu: 75, memory: 68, storage: 45, network: 82 }
    },
    {
      id: 'node-eu-west-1',
      name: 'EU West Secondary',
      region: 'eu-west-1',
      cloud: 'GCP',
      status: 'healthy',
      load: 45,
      uptime: 99.8,
      lastHeartbeat: new Date(Date.now() - 45000).toISOString(),
      services: 8,
      capacity: { cpu: 52, memory: 48, storage: 38, network: 76 }
    },
    {
      id: 'node-ap-southeast-1',
      name: 'Asia Pacific',
      region: 'ap-southeast-1',
      cloud: 'Azure',
      status: 'degraded',
      load: 85,
      uptime: 98.5,
      lastHeartbeat: new Date(Date.now() - 120000).toISOString(),
      services: 6,
      capacity: { cpu: 89, memory: 82, storage: 65, network: 70 }
    },
    {
      id: 'node-hybrid-1',
      name: 'Hybrid Edge',
      region: 'on-premise',
      cloud: 'Hybrid',
      status: 'healthy',
      load: 35,
      uptime: 99.5,
      lastHeartbeat: new Date(Date.now() - 60000).toISOString(),
      services: 4,
      capacity: { cpu: 42, memory: 38, storage: 28, network: 65 }
    }
  ];

  const displayNodes = federationData?.nodes || mockNodes;
  const overview = federationData?.overview || {
    totalNodes: 4,
    activeNodes: 4,
    totalRegions: 4,
    totalWorkloads: 156,
    globalLoad: 58,
    uptime: 99.3
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Network className="h-8 w-8 text-blue-600" />
            <span>Federation Control</span>
          </h1>
          <p className="text-muted-foreground">
            Distributed system management and multi-cloud orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500">
            {overview.uptime}% Uptime
          </Badge>
          <Badge variant="outline">
            {overview.activeNodes}/{overview.totalNodes} Nodes Active
          </Badge>
        </div>
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              {overview.activeNodes} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRegions}</div>
            <p className="text-xs text-muted-foreground">Multi-cloud</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workloads</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalWorkloads}</div>
            <p className="text-xs text-muted-foreground">Distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Load</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.globalLoad}%</div>
            <Progress value={overview.globalLoad} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {healthData?.overall || 'Healthy'}
            </div>
            <p className="text-xs text-muted-foreground">All systems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overview.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nodes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nodes">Federation Nodes</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="network">Network Topology</TabsTrigger>
          <TabsTrigger value="workloads">Workload Management</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Node Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="us-east-1">US East</SelectItem>
                    <SelectItem value="eu-west-1">EU West</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific</SelectItem>
                    <SelectItem value="on-premise">On-Premise</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCloud} onValueChange={setSelectedCloud}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clouds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clouds</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="gcp">Google Cloud</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSelectedRegion('all');
                  setSelectedCloud('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Federation Nodes */}
          <div className="grid md:grid-cols-2 gap-6">
            {displayNodes
              .filter(node => selectedRegion === 'all' || node.region === selectedRegion)
              .filter(node => selectedCloud === 'all' || node.cloud.toLowerCase() === selectedCloud)
              .map((node) => (
              <Card key={node.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCloudIcon(node.cloud)}</div>
                      <div>
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <CardDescription>{node.region} • {node.cloud}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(node.status)}
                      <Badge className={getStatusColor(node.status)}>
                        {node.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Load</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{node.load}%</span>
                        <Progress value={node.load} className="h-2 flex-1" />
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{node.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Services</p>
                      <p className="font-medium">{node.services}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Heartbeat</p>
                      <p className="font-medium text-xs">
                        {Math.round((Date.now() - new Date(node.lastHeartbeat).getTime()) / 1000)}s ago
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span>Resource Utilization</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>CPU</span>
                        <span>{node.capacity.cpu}%</span>
                      </div>
                      <Progress value={node.capacity.cpu} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Memory</span>
                        <span>{node.capacity.memory}%</span>
                      </div>
                      <Progress value={node.capacity.memory} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Storage</span>
                        <span>{node.capacity.storage}%</span>
                      </div>
                      <Progress value={node.capacity.storage} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Network</span>
                        <span>{node.capacity.network}%</span>
                      </div>
                      <Progress value={node.capacity.network} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {/* API Endpoints Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>API Endpoints Health</span>
              </CardTitle>
              <CardDescription>Real-time monitoring of all API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">{endpointsData?.summary?.total || 12}</div>
                  <div className="text-sm text-muted-foreground">Total Endpoints</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{endpointsData?.summary?.healthy || 10}</div>
                  <div className="text-sm text-muted-foreground">Healthy</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-yellow-600">{endpointsData?.summary?.degraded || 1}</div>
                  <div className="text-sm text-muted-foreground">Degraded</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">{endpointsData?.summary?.averageResponseTime || 47}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>

              <div className="space-y-2">
                {(endpointsData?.endpoints || [
                  { path: '/api/governance/dashboard', status: 'healthy', responseTime: 45 },
                  { path: '/api/governance/compliance', status: 'healthy', responseTime: 62 },
                  { path: '/api/ecosystem/status', status: 'healthy', responseTime: 33 },
                  { path: '/api/federated/nodes', status: 'healthy', responseTime: 44 },
                  { path: '/api/health', status: 'healthy', responseTime: 18 }
                ]).map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(endpoint.status)}
                      <span className="font-mono text-sm">{endpoint.path}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={endpoint.status === 'healthy' ? 'default' : 'secondary'}>
                        {endpoint.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{endpoint.responseTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Health */}
          <Card>
            <CardHeader>
              <CardTitle>Service Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(healthData?.services || [
                  { service: 'governance-api', status: 'healthy', responseTime: 45, uptime: 99.9 },
                  { service: 'ecosystem-orchestrator', status: 'healthy', responseTime: 62, uptime: 99.8 },
                  { service: 'federation-control', status: 'healthy', responseTime: 38, uptime: 99.7 },
                  { service: 'ai-manifest-engine', status: 'degraded', responseTime: 156, uptime: 98.5 }
                ]).map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">
                          Response: {service.responseTime}ms • Uptime: {service.uptime}%
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>System Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{metricsData?.metrics?.system?.cpu?.usage || 18}%</span>
                  </div>
                  <Progress value={metricsData?.metrics?.system?.cpu?.usage || 18} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{metricsData?.metrics?.system?.memory?.percentage || 42}%</span>
                  </div>
                  <Progress value={metricsData?.metrics?.system?.memory?.percentage || 42} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk Usage</span>
                    <span>{metricsData?.metrics?.system?.disk?.percentage || 55}%</span>
                  </div>
                  <Progress value={metricsData?.metrics?.system?.disk?.percentage || 55} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>Network Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bytes In</p>
                    <p className="text-lg font-medium">
                      {((metricsData?.metrics?.network?.bytesIn || 750000) / 1000000).toFixed(1)}MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bytes Out</p>
                    <p className="text-lg font-medium">
                      {((metricsData?.metrics?.network?.bytesOut || 600000) / 1000000).toFixed(1)}MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Packets In</p>
                    <p className="text-lg font-medium">
                      {((metricsData?.metrics?.network?.packetsIn || 7500) / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-lg font-medium">{metricsData?.metrics?.network?.errors || 2}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Application Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">
                    {((metricsData?.metrics?.application?.requests?.total || 75000) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {metricsData?.metrics?.application?.requests?.rate || 375}/min
                  </div>
                  <div className="text-sm text-muted-foreground">Request Rate</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">
                    {metricsData?.metrics?.application?.response?.average || 52}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {((metricsData?.metrics?.application?.requests?.errors || 1875) / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Total Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Topology</CardTitle>
              <CardDescription>Multi-cloud federation network architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <Network className="h-16 w-16 mx-auto text-blue-600" />
                <h3 className="text-lg font-medium">Federation Network Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Interactive network topology visualization showing connections between federation nodes,
                  traffic flows, and network performance metrics across all regions and cloud providers.
                </p>
                <Button variant="outline">
                  <Monitor className="h-4 w-4 mr-2" />
                  Launch Network Visualizer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
              <CardDescription>Distributed workload management across federation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Active Workloads</h4>
                  {[
                    { name: 'AI Model Training', nodes: 3, status: 'running', load: 85 },
                    { name: 'Data Processing Pipeline', nodes: 2, status: 'running', load: 62 },
                    { name: 'API Gateway Services', nodes: 4, status: 'running', load: 45 },
                    { name: 'Analytics Engine', nodes: 2, status: 'pending', load: 0 }
                  ].map((workload, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{workload.name}</p>
                        <p className="text-sm text-muted-foreground">{workload.nodes} nodes</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={workload.status === 'running' ? 'default' : 'secondary'}>
                          {workload.status}
                        </Badge>
                        <span className="text-sm">{workload.load}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Resource Allocation</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Compute Resources</span>
                        <span>68% allocated</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Resources</span>
                        <span>72% allocated</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Resources</span>
                        <span>45% allocated</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network Bandwidth</span>
                        <span>58% allocated</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}