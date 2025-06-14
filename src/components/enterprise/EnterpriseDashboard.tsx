import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Brain,
  Target,
  Settings,
  Database,
  Lock,
  Monitor
} from 'lucide-react';

interface AgentMetrics {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy';
  performance: {
    successRate: number;
    averageResponseTime: number;
    tasksCompleted: number;
    validationsPassed: number;
  };
  expertise: string[];
  currentTask?: string;
}

interface TaskMetrics {
  activeTasks: number;
  totalAgents: number;
  averageQuality: number;
  systemLoad: number;
  coordinationStats: {
    tasksToday: number;
    tasksThisWeek: number;
    averageTaskDuration: number;
    successRate: number;
  };
}

interface EnterpriseTask {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'in_progress' | 'review' | 'completed' | 'failed';
  progress: number;
  assignedAgents: string[];
  estimatedTime: number;
  createdAt: string;
}

export default function EnterpriseDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch coordination metrics
  const { data: metrics } = useQuery({
    queryKey: ['/api/coordinator/metrics'],
    refetchInterval: 5000
  });

  // Fetch agent status
  const { data: agents } = useQuery({
    queryKey: ['/api/coordinator/agents'],
    refetchInterval: 3000
  });

  // Fetch enterprise tasks for current project
  const { data: tasks } = useQuery({
    queryKey: ['/api/enterprise/tasks/1'],
    refetchInterval: 2000
  });

  // Fetch security audit data
  const { data: securityAudit } = useQuery({
    queryKey: ['/api/enterprise/security/audit/1'],
    refetchInterval: 30000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'idle': return 'bg-gray-400';
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Enterprise AI Development Platform
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Advanced multi-agent coordination and intelligent task management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Tasks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics?.activeTasks || 8}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">+12%</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">from last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Agents</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics?.totalAgents || 6}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">All operational</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quality Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics?.averageQuality || 94}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={metrics?.averageQuality || 94} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">System Load</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {metrics?.systemLoad || 65}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={metrics?.systemLoad || 65} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Frontend Specialist completed dashboard component', time: '2 min ago', type: 'success' },
                      { action: 'Security scan initiated for project authentication', time: '5 min ago', type: 'info' },
                      { action: 'Backend API optimization task assigned', time: '8 min ago', type: 'info' },
                      { action: 'Testing Specialist validated user registration flow', time: '12 min ago', type: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900 dark:text-white">{activity.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>34%</span>
                      </div>
                      <Progress value={34} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network I/O</span>
                        <span>23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Load</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents?.map((agent: AgentMetrics) => (
                <Card key={agent.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Performance</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Success Rate</span>
                            <p className="font-semibold">{agent.performance.successRate}%</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Completed</span>
                            <p className="font-semibold">{agent.performance.tasksCompleted}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Expertise</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.expertise.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill.split('/')[0]}
                            </Badge>
                          ))}
                          {agent.expertise.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.expertise.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {agent.currentTask && (
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Current Task</p>
                          <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 rounded px-2 py-1">
                            {agent.currentTask}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Active Enterprise Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => ({
                    id: `task_${i + 1}`,
                    type: ['frontend', 'backend', 'security', 'testing', 'deployment'][i % 5],
                    description: [
                      'Implement responsive dashboard interface with real-time updates',
                      'Optimize database queries for improved performance',
                      'Conduct comprehensive security audit and vulnerability assessment',
                      'Create automated test suite for user authentication flow',
                      'Set up CI/CD pipeline with automated deployment',
                      'Design and implement enterprise API rate limiting'
                    ][i],
                    priority: ['high', 'medium', 'critical', 'medium', 'high', 'low'][i] as any,
                    status: ['in_progress', 'review', 'completed', 'in_progress', 'queued', 'in_progress'][i] as any,
                    progress: [75, 90, 100, 45, 0, 65][i],
                    assignedAgents: [2, 1, 2, 1, 3, 2][i],
                    estimatedTime: [180, 240, 120, 300, 480, 150][i]
                  })).map((task) => (
                    <div key={task.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">
                            {task.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                          <span className="text-sm text-slate-500 capitalize">{task.status}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {task.description}
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Progress</span>
                          <div className="mt-1">
                            <Progress value={task.progress} className="h-2" />
                            <span className="text-xs text-slate-400">{task.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Assigned Agents</span>
                          <p className="font-medium">{task.assignedAgents}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Estimated Time</span>
                          <p className="font-medium">{Math.round(task.estimatedTime / 60)}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Security Score</span>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">85</span>
                        <span className="text-slate-500 ml-1">/100</span>
                      </div>
                    </div>
                    <Progress value={85} className="h-3" />
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Vulnerabilities Found</span>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          1
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>GDPR Compliance</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Compliant
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Audit</span>
                        <span className="text-slate-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'GDPR', status: 'compliant', score: 95 },
                      { name: 'SOX', status: 'compliant', score: 88 },
                      { name: 'HIPAA', status: 'review_needed', score: 72 }
                    ].map((compliance, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{compliance.name}</span>
                          <div className="text-sm text-slate-500 capitalize">
                            {compliance.status.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{compliance.score}%</div>
                          <Progress value={compliance.score} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Daily Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Tasks Completed</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                      <span className="font-semibold">96.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Avg Duration</span>
                      <span className="font-semibold">2.4h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Agent Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Frontend Specialist', utilization: 78 },
                      { name: 'Backend Specialist', utilization: 65 },
                      { name: 'Database Specialist', utilization: 45 },
                      { name: 'Security Specialist', utilization: 82 },
                      { name: 'Testing Specialist', utilization: 71 },
                      { name: 'Deployment Specialist', utilization: 38 }
                    ].map((agent, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{agent.name}</span>
                          <span>{agent.utilization}%</span>
                        </div>
                        <Progress value={agent.utilization} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}