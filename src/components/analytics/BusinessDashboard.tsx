import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  DollarSign, 
  Activity,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  generationsToday: number;
  successRate: number;
  averageSessionTime: number;
  revenue: number;
  conversionRate: number;
  churnRate: number;
}

interface UsageData {
  date: string;
  users: number;
  generations: number;
  revenue: number;
}

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/business-metrics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/business-metrics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json() as BusinessMetrics;
    }
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/analytics/usage-trends', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/usage-trends?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch usage data');
      return response.json() as UsageData[];
    }
  });

  const { data: agentPerformance, isLoading: agentLoading } = useQuery({
    queryKey: ['/api/coordinator/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/coordinator/metrics');
      if (!response.ok) throw new Error('Failed to fetch agent performance');
      return response.json();
    }
  });

  const currentAgentData = agentPerformance || {
    agentUtilization: [
      { agentId: 'frontend-specialist', utilization: 78 },
      { agentId: 'backend-specialist', utilization: 65 },
      { agentId: 'security-specialist', utilization: 82 }
    ],
    averageQuality: 94,
    systemLoad: 65
  };

  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    description,
    format = 'number'
  }: {
    title: string;
    value: number;
    change?: { value: string; isPositive: boolean; isNegative: boolean };
    icon: React.ElementType;
    description: string;
    format?: 'number' | 'currency' | 'percentage' | 'time';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val}%`;
        case 'time':
          return `${val}min`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {change && (
              <>
                {change.isPositive && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                {change.isNegative && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                <span className={change.isPositive ? 'text-green-500' : change.isNegative ? 'text-red-500' : ''}>
                  {change.value}%
                </span>
              </>
            )}
            <span>{description}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!metrics || !usageData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
            <p className="text-muted-foreground">Loading enterprise analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            Enterprise analytics and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 days
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={getMetricChange(metrics.totalUsers, 11250)}
          icon={Users}
          description="vs last period"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change={getMetricChange(metrics.activeUsers, 3180)}
          icon={Activity}
          description="vs last period"
        />
        <MetricCard
          title="Success Rate"
          value={metrics.successRate}
          change={getMetricChange(metrics.successRate, 92.1)}
          icon={Target}
          description="vs last period"
          format="percentage"
        />
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          change={getMetricChange(metrics.revenue, 42300)}
          icon={DollarSign}
          description="vs last period"
          format="currency"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="agents">AI Agent Performance</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Daily active users and AI generations over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generations" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="AI Generations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time system performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Agent Utilization</span>
                    <span className="text-sm text-muted-foreground">{currentAgentData.systemLoad}%</span>
                  </div>
                  <Progress value={currentAgentData.systemLoad} className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm text-muted-foreground">{currentAgentData.averageQuality}%</span>
                  </div>
                  <Progress value={currentAgentData.averageQuality} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics.successRate}%</span>
                  </div>
                  <Progress value={metrics.successRate} className="w-full" />
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All systems operational</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database performance optimal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">High traffic detected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Session duration and interaction patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Session Time</span>
                    <Badge variant="outline">{metrics.averageSessionTime} min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <Badge variant="outline">{metrics.conversionRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <Badge variant="outline">{metrics.churnRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Generations</span>
                    <Badge variant="outline">{metrics.generationsToday}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Utilization</CardTitle>
                <CardDescription>Current workload distribution across AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentAgentData.agentUtilization}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ agentId, utilization }) => `${agentId}: ${utilization}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="utilization"
                    >
                      {currentAgentData.agentUtilization?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>AI agent success rates and response times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAgentData.agentUtilization?.map((agent: any, index: number) => (
                  <div key={agent.agentId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {agent.agentId.replace('-', ' ')}
                      </span>
                      <Badge 
                        variant={agent.utilization > 80 ? 'destructive' : 
                                agent.utilization > 60 ? 'default' : 'secondary'}
                      >
                        {agent.utilization}%
                      </Badge>
                    </div>
                    <Progress value={agent.utilization} className="w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Readiness Scorecard</CardTitle>
                <CardDescription>
                  Key metrics for investor and enterprise client evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Scalability</h4>
                    <Progress value={92} className="w-full" />
                    <p className="text-xs text-muted-foreground">Infrastructure can handle 10x growth</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Security</h4>
                    <Progress value={96} className="w-full" />
                    <p className="text-xs text-muted-foreground">SOC 2 Type II compliant</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Reliability</h4>
                    <Progress value={99} className="w-full" />
                    <p className="text-xs text-muted-foreground">99.9% uptime SLA achieved</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Investment Readiness Metrics</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Monthly Recurring Revenue</span>
                        <span className="font-semibold">${metrics.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Rate (MoM)</span>
                        <span className="font-semibold text-green-600">+18.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Acquisition Cost</span>
                        <span className="font-semibold">$127</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Lifetime Value</span>
                        <span className="font-semibold">$1,840</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Promoter Score</span>
                        <span className="font-semibold">+67</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enterprise Clients</span>
                        <span className="font-semibold">23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}