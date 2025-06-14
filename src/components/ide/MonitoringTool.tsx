import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Server,
  Zap,
  Globe,
  Shield,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Download,
  Bell
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function MonitoringTool() {
  const [activeTimeframe, setActiveTimeframe] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const metrics: MetricCard[] = [
    {
      title: 'Response Time',
      value: '234ms',
      change: '-12%',
      trend: 'down',
      status: 'healthy'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8%',
      trend: 'up',
      status: 'healthy'
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      change: '+0.05%',
      trend: 'up',
      status: 'warning'
    },
    {
      title: 'CPU Usage',
      value: '67%',
      change: '+15%',
      trend: 'up',
      status: 'warning'
    },
    {
      title: 'Memory Usage',
      value: '4.2GB',
      change: '-3%',
      trend: 'down',
      status: 'healthy'
    },
    {
      title: 'Database Load',
      value: '23%',
      change: '-7%',
      trend: 'down',
      status: 'healthy'
    }
  ];

  const alerts: Alert[] = [
    {
      id: 'alert-001',
      type: 'warning',
      message: 'High CPU usage detected on production server',
      timestamp: '2 minutes ago',
      resolved: false
    },
    {
      id: 'alert-002',
      type: 'error',
      message: 'Database connection timeout in user authentication',
      timestamp: '15 minutes ago',
      resolved: true
    },
    {
      id: 'alert-003',
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '1 hour ago',
      resolved: true
    }
  ];

  const performanceData = [
    { time: '00:00', responseTime: 180, requests: 450, errors: 2 },
    { time: '04:00', responseTime: 165, requests: 320, errors: 1 },
    { time: '08:00', responseTime: 220, requests: 780, errors: 5 },
    { time: '12:00', responseTime: 280, requests: 1200, errors: 8 },
    { time: '16:00', responseTime: 245, requests: 980, errors: 3 },
    { time: '20:00', responseTime: 190, requests: 650, errors: 2 },
    { time: '24:00', responseTime: 234, requests: 520, errors: 1 }
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Production Monitoring</h3>
          <Badge variant="outline" className="text-blue-600">Live Analytics</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-700">Time Period:</span>
        <div className="flex bg-white rounded-lg p-1 border">
          {['1h', '6h', '24h', '7d', '30d'].map(period => (
            <button
              key={period}
              onClick={() => setActiveTimeframe(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTimeframe === period ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Key Metrics */}
        <div className="lg:col-span-3 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className={`border ${getStatusColor(metric.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <Badge variant="outline" className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between bg-gray-50 rounded p-4">
                  {performanceData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="bg-blue-500 w-8 rounded-t"
                        style={{ height: `${(data.responseTime / 300) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-600">{data.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Average: 234ms</span>
                  <span>Peak: 280ms</span>
                  <span>Target: &lt;300ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Request Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between bg-gray-50 rounded p-4">
                  {performanceData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="bg-green-500 w-8 rounded-t"
                        style={{ height: `${(data.requests / 1200) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-600">{data.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Total: 4,900 requests</span>
                  <span>Peak: 1,200/hr</span>
                  <span>Avg: 700/hr</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Infrastructure Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-green-800">Web Servers</div>
                  <div className="text-sm text-green-600">3/3 Online</div>
                  <div className="text-xs text-green-500 mt-1">99.9% Uptime</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-green-800">Database</div>
                  <div className="text-sm text-green-600">Primary Active</div>
                  <div className="text-xs text-green-500 mt-1">23ms Latency</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="font-medium text-yellow-800">Cache Layer</div>
                  <div className="text-sm text-yellow-600">High Load</div>
                  <div className="text-xs text-yellow-500 mt-1">78% Hit Rate</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-green-800">Security</div>
                  <div className="text-sm text-green-600">All Systems</div>
                  <div className="text-xs text-green-500 mt-1">0 Threats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${
                    alert.resolved ? 'bg-gray-50 border-gray-200' : 
                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        alert.resolved ? 'text-gray-600' : 
                        alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {alert.timestamp}
                        {alert.resolved && ' • Resolved'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Sessions</span>
                  <span className="font-medium">1,247</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Page Views</span>
                  <span className="font-medium">8,934</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls</span>
                  <span className="font-medium">45,231</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Bounce Rate:</span>
                    <span>23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session:</span>
                    <span>4m 32s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion:</span>
                    <span>3.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm">Direct</span>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Search</span>
                  </div>
                  <span className="text-sm font-medium">32%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Social</span>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-sm">Referral</span>
                  </div>
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}