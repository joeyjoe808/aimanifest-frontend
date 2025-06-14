import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link, useLocation } from 'wouter';
import { 
  Code, 
  Zap, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  FileCode,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import AimanifestLogo from '@/components/ui/aimanifest-logo';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    aiRequests: number;
    projects: number;
    storage: number;
    collaborators: number;
  };
  limits: {
    aiRequests: number;
    projects: number;
    storage: number;
    collaborators: number;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'building' | 'deployed' | 'error';
  lastModified: string;
  url?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for OAuth token in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('authToken', token);
      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        setLocation('/auth');
        return;
      }

      // Load user from localStorage for demonstration
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({
          ...userData,
          usage: {
            aiRequests: 847,
            projects: 12,
            storage: 2.1,
            collaborators: 3
          },
          limits: {
            aiRequests: userData.plan === 'pro' ? 10000 : userData.plan === 'enterprise' ? 100000 : 100,
            projects: userData.plan === 'pro' ? 50 : userData.plan === 'enterprise' ? 500 : 5,
            storage: userData.plan === 'pro' ? 100 : userData.plan === 'enterprise' ? 1000 : 1,
            collaborators: userData.plan === 'pro' ? 10 : userData.plan === 'enterprise' ? 100 : 1
          }
        });
      }

      // Live demonstration projects
      const demoProjects: Project[] = [
        {
          id: 'proj_ai_engine',
          name: 'AI Manifest Engine',
          description: 'Live demonstration of multi-agent AI code generation platform',
          status: 'deployed',
          lastModified: new Date().toISOString(),
          url: 'http://localhost:5000'
        },
        {
          id: 'proj_ecommerce',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce with Stripe payments and real-time inventory',
          status: 'deployed',
          lastModified: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          url: 'https://demo-ecommerce.aimanifest.dev'
        },
        {
          id: 'proj_task_mgmt',
          name: 'Task Management System',
          description: 'Collaborative project management with AI-powered insights',
          status: 'building',
          lastModified: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: 'proj_analytics',
          name: 'Analytics Dashboard',
          description: 'Real-time data visualization with predictive AI analytics',
          status: 'active',
          lastModified: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
      ];
      
      setProjects(demoProjects);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Project ${projects.length + 1}`,
          description: 'New AI-powered project'
        })
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([...projects, newProject]);
        setLocation(`/ide/${newProject.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const upgradeToProPlan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: 'price_pro_monthly',
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard`
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AimanifestLogo size={48} showText={true} />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const usagePercentage = {
    aiRequests: (user.usage.aiRequests / user.limits.aiRequests) * 100,
    projects: (user.usage.projects / user.limits.projects) * 100,
    storage: (user.usage.storage / user.limits.storage) * 100,
    collaborators: (user.usage.collaborators / user.limits.collaborators) * 100
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AimanifestLogo size={32} showText={true} />
              <div className="ml-6">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                {user.plan.toUpperCase()} Plan
              </Badge>
              {user.plan === 'free' && (
                <Button onClick={upgradeToProPlan} className="bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              )}
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="usage">Usage & Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={createNewProject}>
                <CardContent className="flex items-center p-6">
                  <Plus className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">New Project</h3>
                    <p className="text-sm text-gray-600">Start building with AI</p>
                  </div>
                </CardContent>
              </Card>

              <Link href="/ide">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center p-6">
                    <Code className="h-8 w-8 text-green-600 mr-4" />
                    <div>
                      <h3 className="font-semibold">Open IDE</h3>
                      <p className="text-sm text-gray-600">Continue coding</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/ai-manifest-demo">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center p-6">
                    <Zap className="h-8 w-8 text-yellow-600 mr-4" />
                    <div>
                      <h3 className="font-semibold">AI Generator</h3>
                      <p className="text-sm text-gray-600">Create with AI</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Team</h3>
                    <p className="text-sm text-gray-600">Manage collaborators</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCode className="mr-2 h-5 w-5" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Your latest AI-powered projects</CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileCode className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
                    <p className="mt-2 text-gray-600">Get started by creating your first AI-powered project.</p>
                    <Button onClick={createNewProject} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {project.status === 'active' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {project.status === 'building' && <Clock className="h-5 w-5 text-yellow-500" />}
                            {project.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {project.status === 'deployed' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{project.lastModified}</span>
                          <Link href={`/ide/${project.id}`}>
                            <Button variant="outline" size="sm">Open</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <Button onClick={createNewProject}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileCode className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No projects yet</h3>
                  <p className="mt-2 text-gray-600">Create your first project to get started with AI-powered development.</p>
                  <Button onClick={createNewProject} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge variant={project.status === 'deployed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Modified {project.lastModified}</span>
                        <div className="flex gap-2">
                          {project.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={project.url} target="_blank" rel="noopener noreferrer">
                                View Live
                              </a>
                            </Button>
                          )}
                          <Link href={`/ide/${project.id}`}>
                            <Button size="sm">Open</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{user.plan.toUpperCase()} Plan</span>
                      <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                        {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? '$29/month' : '$99/month'}
                      </Badge>
                    </div>
                    {user.plan === 'free' && (
                      <Button onClick={upgradeToProPlan} className="w-full">
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Overview</CardTitle>
                  <CardDescription>Your current usage this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Requests</span>
                      <span>{user.usage.aiRequests} / {user.limits.aiRequests}</span>
                    </div>
                    <Progress value={usagePercentage.aiRequests} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Projects</span>
                      <span>{user.usage.projects} / {user.limits.projects}</span>
                    </div>
                    <Progress value={usagePercentage.projects} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{user.usage.storage}GB / {user.limits.storage}GB</span>
                    </div>
                    <Progress value={usagePercentage.storage} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Collaborators</span>
                      <span>{user.usage.collaborators} / {user.limits.collaborators}</span>
                    </div>
                    <Progress value={usagePercentage.collaborators} />
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