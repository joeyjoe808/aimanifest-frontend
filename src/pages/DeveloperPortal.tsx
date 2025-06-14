import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Book, 
  Code, 
  Users, 
  Download, 
  Star, 
  MessageCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Globe,
  Search,
  ExternalLink,
  Copy,
  ThumbsUp,
  Eye,
  FileText,
  Terminal,
  Lightbulb
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  category: string;
  authentication: string;
  deprecated: boolean;
  examples: Array<{
    language: string;
    title: string;
    code: string;
    description: string;
  }>;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  featured: boolean;
  completionRate: number;
  tags: string[];
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    reputation: number;
    badge: string;
  };
  category: string;
  tags: string[];
  votes: number;
  replies: number;
  views: number;
  solved: boolean;
  createdAt: string;
}

interface SDK {
  language: string;
  version: string;
  downloadUrl: string;
  installation: string;
  downloads: number;
  lastUpdated: string;
}

export default function DeveloperPortal() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch portal overview
  const { data: overviewData } = useQuery<{
    overview: {
      statistics: any;
      quickStats: any;
      featuredContent: any;
    };
  }>({
    queryKey: ['/api/developer-portal/overview'],
    refetchInterval: 300000,
  });

  // Fetch API reference
  const { data: apiData } = useQuery<{
    endpoints: APIEndpoint[];
    categories: string[];
  }>({
    queryKey: ['/api/developer-portal/api-reference', selectedCategory, searchTerm],
    enabled: true,
  });

  // Fetch tutorials
  const { data: tutorialsData } = useQuery<{
    tutorials: Tutorial[];
    categories: string[];
  }>({
    queryKey: ['/api/developer-portal/tutorials'],
  });

  // Fetch community posts
  const { data: communityData } = useQuery<{
    posts: CommunityPost[];
    categories: string[];
    popularTags: string[];
    statistics: any;
  }>({
    queryKey: ['/api/developer-portal/community'],
  });

  // Fetch SDKs
  const { data: sdksData } = useQuery<{
    sdks: SDK[];
    totalDownloads: number;
  }>({
    queryKey: ['/api/developer-portal/sdks'],
  });

  const submitFeedback = async () => {
    try {
      await apiRequest('POST', '/api/developer-portal/feedback', {
        type: feedbackType,
        message: feedbackMessage
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
      });

      setFeedbackType('');
      setFeedbackMessage('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Code example copied successfully",
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'PATCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Developer Portal</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete platform for AI development with comprehensive APIs, tutorials, community support, and enterprise tools
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {overviewData?.overview?.statistics?.totalDevelopers?.toLocaleString() || '15.4K'}
            </div>
            <div className="text-sm text-muted-foreground">Active Developers</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {overviewData?.overview?.statistics?.apiCalls24h?.toLocaleString() || '156K'}
            </div>
            <div className="text-sm text-muted-foreground">API Calls (24h)</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {overviewData?.overview?.statistics?.successfulIntegrations?.toLocaleString() || '4.5K'}
            </div>
            <div className="text-sm text-muted-foreground">Integrations</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {overviewData?.overview?.quickStats?.uptime || 99.9}%
            </div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-docs">API Docs</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Featured Content */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Getting Started</span>
                </CardTitle>
                <CardDescription>Quick start guides and essential resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">5-Minute Quickstart</h4>
                  <p className="text-sm text-muted-foreground">From registration to first API call</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Start Tutorial
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">API Authentication</h4>
                  <p className="text-sm text-muted-foreground">Set up API keys and OAuth flows</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Learn More
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Choose Your SDK</h4>
                  <p className="text-sm text-muted-foreground">Available in 8+ programming languages</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    View SDKs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Community Highlights</span>
                </CardTitle>
                <CardDescription>Active discussions and popular topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {communityData?.posts?.slice(0, 3).map((post) => (
                  <div key={post.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">{post.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{post.votes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.replies}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </span>
                      {post.solved && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>Real-time metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.statistics?.activeProjects?.toLocaleString() || '3.2K'}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Projects</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.statistics?.communityPosts?.toLocaleString() || '2.3K'}
                  </div>
                  <div className="text-xs text-muted-foreground">Forum Posts</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.quickStats?.averageResponseTime || 145}ms
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.quickStats?.apiSuccessRate || 99.7}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.statistics?.averageIntegrationTime || '12 min'}
                  </div>
                  <div className="text-xs text-muted-foreground">Integration Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xl font-bold">
                    {overviewData?.overview?.quickStats?.supportSatisfaction || 4.8}/5
                  </div>
                  <div className="text-xs text-muted-foreground">Support Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-docs" className="space-y-6">
          {/* API Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search API endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {apiData?.categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Endpoints */}
          <div className="space-y-4">
            {apiData?.endpoints?.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                        <code className="text-sm text-muted-foreground">{endpoint.path}</code>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{endpoint.category}</Badge>
                      <Badge variant="outline">{endpoint.authentication}</Badge>
                      {endpoint.deprecated && <Badge variant="destructive">Deprecated</Badge>}
                    </div>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                
                {endpoint.examples && endpoint.examples.length > 0 && (
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-medium">Code Examples</h4>
                      {endpoint.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{example.language}</Badge>
                              <span className="text-sm font-medium">{example.title}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(example.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm">{example.code}</code>
                          </pre>
                          <p className="text-sm text-muted-foreground">{example.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6">
            {tutorialsData?.tutorials?.map((tutorial) => (
              <Card key={tutorial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{tutorial.title}</span>
                        {tutorial.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      </CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.estimatedTime}m
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Category: {tutorial.category}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completion: {tutorial.completionRate}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {tutorial.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm">Start Tutorial</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid gap-4">
            {communityData?.posts?.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>by {post.author.name}</span>
                        <Badge variant="outline">{post.author.badge}</Badge>
                        <span>Reputation: {post.author.reputation}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{post.category}</Badge>
                      {post.solved && <Badge className="bg-green-500">Solved</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.votes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.replies} replies</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views} views</span>
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Official SDKs & Libraries</span>
              </CardTitle>
              <CardDescription>
                Download count: {sdksData?.totalDownloads?.toLocaleString() || '24K+'} total downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {sdksData?.sdks?.map((sdk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{sdk.language}</h4>
                      <Badge variant="outline">v{sdk.version}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Downloads:</span>
                        <span>{sdk.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(sdk.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono">
                        {sdk.installation}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={sdk.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Docs
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>Help us improve the developer experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Describe your feedback..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                />
                
                <Button 
                  onClick={submitFeedback}
                  disabled={!feedbackType || !feedbackMessage}
                  className="w-full"
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>Get help when you need it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive guides and FAQs</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Browse Articles
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Community Forum</h4>
                  <p className="text-sm text-muted-foreground">Ask questions and get answers</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Users className="h-4 w-4 mr-1" />
                    Join Discussion
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Status Page</h4>
                  <p className="text-sm text-muted-foreground">Real-time system status</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Globe className="h-4 w-4 mr-1" />
                    Check Status
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground">Direct support for urgent issues</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}