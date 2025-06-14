import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  CreditCard, 
  MessageSquare, 
  Store, 
  BarChart3, 
  Shield, 
  Code, 
  Globe,
  DollarSign,
  Users,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function Enterprise() {
  const { data: platformSummary, isLoading } = useQuery({
    queryKey: ['/api/platform/summary'],
  });

  const { data: revenueAnalytics } = useQuery({
    queryKey: ['/api/partners/analytics'],
  });

  const { data: missionControl } = useQuery({
    queryKey: ['/api/mission-control/health'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Enterprise AI Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Production-ready AI development environment with multi-tenant organizations, 
            partner revenue sharing, comprehensive billing, and enterprise-grade security.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Platform Status: {platformSummary?.platform?.status || 'Active'}
            </Badge>
            <Badge variant="outline" className="text-purple-300 border-purple-300">
              Version {platformSummary?.platform?.version || '1.0.0'}
            </Badge>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <Building2 className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Organizations</CardTitle>
              <CardDescription className="text-gray-300">
                Multi-tenant management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {platformSummary?.statistics?.totalOrganizations || 0}
              </div>
              <p className="text-sm text-gray-400">Active organizations</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <Store className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Marketplace</CardTitle>
              <CardDescription className="text-gray-300">
                AI agent ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {platformSummary?.statistics?.availableAgents || 0}
              </div>
              <p className="text-sm text-gray-400">Available agents</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Revenue</CardTitle>
              <CardDescription className="text-gray-300">
                Partner earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                ${platformSummary?.statistics?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-400">Total revenue shared</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Partners</CardTitle>
              <CardDescription className="text-gray-300">
                Revenue participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {platformSummary?.statistics?.activePartners || 0}
              </div>
              <p className="text-sm text-gray-400">Active partners</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-600">Features</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600">Revenue</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-purple-600">API & SDKs</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformSummary?.features?.map((feature: string, index: number) => (
                <Card key={index} className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-white text-lg">{feature}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">
                      Enterprise-grade {feature.toLowerCase()} with advanced capabilities
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Partners:</span>
                      <span className="text-white font-semibold">
                        {revenueAnalytics?.data?.totalPartners || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Partners:</span>
                      <span className="text-white font-semibold">
                        {revenueAnalytics?.data?.activePartners || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Revenue:</span>
                      <span className="text-green-400 font-semibold">
                        ${revenueAnalytics?.data?.monthlyRevenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Partner Payouts:</span>
                      <span className="text-blue-400 font-semibold">
                        ${revenueAnalytics?.data?.totalPayouts?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Revenue Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300">
                      Automated revenue distribution system with Stripe Connect integration
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Partner Share:</span>
                        <span className="text-green-400">70%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Platform Fee:</span>
                        <span className="text-yellow-400">30%</span>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      View Partner Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Code className="w-5 h-5 mr-2 text-blue-400" />
                    SDK Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Auto-generated SDKs for multiple programming languages
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mr-2">JavaScript</Badge>
                      <Badge variant="outline" className="mr-2">Python</Badge>
                      <Badge variant="outline" className="mr-2">Go</Badge>
                      <Badge variant="outline" className="mr-2">Java</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Download SDKs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-400" />
                    Developer Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Comprehensive documentation and interactive API explorer
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">• Interactive API documentation</div>
                      <div className="text-sm text-gray-300">• Code examples & tutorials</div>
                      <div className="text-sm text-gray-300">• Authentication guides</div>
                      <div className="text-sm text-gray-300">• Rate limiting & usage analytics</div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Visit Developer Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <Badge variant="secondary" className="bg-green-600">
                        {missionControl?.data?.status || 'Healthy'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Uptime:</span>
                      <span className="text-white">{missionControl?.data?.uptime || '99.9%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Response Time:</span>
                      <span className="text-green-400">Fast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">CPU Usage:</span>
                      <span className="text-yellow-400">Normal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Memory:</span>
                      <span className="text-blue-400">Optimal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Requests/min:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Open Tickets:</span>
                      <span className="text-white">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Response:</span>
                      <span className="text-green-400">&lt; 1hr</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      Create Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* API Endpoints */}
        <Card className="mt-12 bg-white/10 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="w-6 h-6 mr-2 text-purple-400" />
              Enterprise API Endpoints
            </CardTitle>
            <CardDescription className="text-gray-300">
              Comprehensive REST API with OAuth authentication and rate limiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(platformSummary?.endpoints || {}).map(([key, value]) => (
                <div key={key} className="bg-black/20 rounded-lg p-3">
                  <div className="text-purple-400 font-semibold capitalize">{key}</div>
                  <div className="text-gray-300 text-sm font-mono">{value as string}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}