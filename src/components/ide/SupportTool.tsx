import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Book,
  Bug,
  Lightbulb,
  Users,
  Zap,
  Shield,
  Database,
  Globe
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  category: 'bug' | 'feature' | 'deployment' | 'authentication' | 'performance';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: string;
  resolvedAt?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

export default function SupportTool() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: 'create-first-app',
      question: 'How do I create my first application?',
      answer: 'Simply describe what you want to build in plain English. For example: "Create a todo app with user accounts and due date reminders." The AI will understand your request and start building immediately. You can watch the code being written in real-time through the Live Coding tab.',
      category: 'getting-started',
      helpful: 247,
      views: 1823
    },
    {
      id: 'typos-understanding',
      question: 'What if I make typos or use incomplete sentences?',
      answer: 'The AI is designed to understand natural language including typos, incomplete thoughts, and casual language. You can type "build me a socail media app with chat" (note the typo) and it will understand you want a social media application with chat functionality.',
      category: 'getting-started',
      helpful: 189,
      views: 1456
    },
    {
      id: 'deployment-issues',
      question: 'My app won\'t deploy - what should I check?',
      answer: 'Common deployment issues: 1) Check environment variables are set correctly 2) Verify SSL certificates are valid 3) Ensure database connections are working 4) Check the deployment logs in the Deployment tab for specific error messages. The system creates automatic backups before each deployment.',
      category: 'deployment',
      helpful: 156,
      views: 892
    },
    {
      id: 'api-keys',
      question: 'How do I add API keys for external services?',
      answer: 'Navigate to Project Settings and add your API keys in the Environment Variables section. Common keys include OPENAI_API_KEY for AI features, STRIPE_SECRET_KEY for payments, and TWILIO_AUTH_TOKEN for SMS. All keys are encrypted and stored securely.',
      category: 'authentication',
      helpful: 203,
      views: 1234
    },
    {
      id: 'performance-slow',
      question: 'Why is my application running slowly?',
      answer: 'Performance issues can be caused by: 1) Large file uploads without optimization 2) Inefficient database queries 3) Missing caching layers 4) Too many API calls. Use the Monitoring tab to identify bottlenecks and the Performance Analyzer to get optimization suggestions.',
      category: 'performance',
      helpful: 134,
      views: 756
    },
    {
      id: 'rollback-version',
      question: 'How do I rollback to a previous version?',
      answer: 'Click the "Rollback" button in the deployment history section. The system maintains automatic snapshots of your database and files. Rollbacks typically complete within 2-3 minutes and include health checks to verify the previous version is working correctly.',
      category: 'deployment',
      helpful: 178,
      views: 923
    },
    {
      id: 'real-time-features',
      question: 'Can I add real-time chat or live updates?',
      answer: 'Yes! Request features like "Add real-time chat between users" or "Live notifications when orders are placed." The AI will implement WebSocket connections, user presence detection, and real-time data synchronization automatically.',
      category: 'features',
      helpful: 267,
      views: 1567
    },
    {
      id: 'database-backup',
      question: 'How often are database backups created?',
      answer: 'Automatic backups occur every 6 hours for active projects and before every deployment. You can also create manual backups anytime. Backups include full database snapshots, file systems, and configuration settings. Retention period is 30 days for automatic backups.',
      category: 'database',
      helpful: 145,
      views: 687
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: 'TICK-001',
      title: 'Authentication not working after deployment',
      category: 'authentication',
      status: 'in-progress',
      priority: 'high',
      description: 'Users cannot log in after deploying to production. Getting "Invalid credentials" error.',
      createdAt: '2 hours ago'
    },
    {
      id: 'TICK-002',
      title: 'Request feature: Dark mode toggle',
      category: 'feature',
      status: 'open',
      priority: 'medium',
      description: 'Would like to add a dark mode option for better user experience.',
      createdAt: '1 day ago'
    },
    {
      id: 'TICK-003',
      title: 'Database connection timeout errors',
      category: 'performance',
      status: 'resolved',
      priority: 'critical',
      description: 'Intermittent database timeouts during peak usage hours.',
      createdAt: '3 days ago',
      resolvedAt: '1 day ago'
    }
  ];

  const troubleshootingSteps = [
    {
      title: 'Application Won\'t Start',
      steps: [
        'Check environment variables are set correctly',
        'Verify database connection string',
        'Ensure all required API keys are provided',
        'Check server logs for specific error messages',
        'Try restarting the application server'
      ]
    },
    {
      title: 'Deployment Fails',
      steps: [
        'Verify SSL certificates are valid and not expired',
        'Check disk space on target server',
        'Ensure database migrations complete successfully',
        'Validate environment-specific configuration',
        'Test deployment in staging environment first'
      ]
    },
    {
      title: 'Performance Issues',
      steps: [
        'Check database query performance and add indexes',
        'Optimize large file uploads and implement compression',
        'Enable caching for frequently accessed data',
        'Monitor memory usage and optimize code',
        'Consider implementing load balancing'
      ]
    },
    {
      title: 'Authentication Problems',
      steps: [
        'Verify user credentials and password requirements',
        'Check session configuration and expiration settings',
        'Ensure HTTPS is properly configured',
        'Validate API keys and external service connections',
        'Test with different browsers and clear cookies'
      ]
    }
  ];

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'feature': return <Lightbulb className="h-4 w-4" />;
      case 'deployment': return <Globe className="h-4 w-4" />;
      case 'authentication': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Support Center</h3>
          <Badge variant="outline" className="text-green-600">24/7 Available</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>

      {/* Support Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-white rounded-lg p-1 border">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'faq' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="h-4 w-4 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'troubleshooting' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Troubleshooting
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === 'tickets' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Support Tickets
          </button>
        </div>

        {activeTab === 'faq' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="getting-started">Getting Started</option>
              <option value="deployment">Deployment</option>
              <option value="authentication">Authentication</option>
              <option value="performance">Performance</option>
              <option value="features">Features</option>
              <option value="database">Database</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {filteredFAQ.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.question}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{item.views} views</span>
                      <span>•</span>
                      <span>{item.helpful} helpful</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{item.answer}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {item.category.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        👍 Helpful
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Troubleshooting Tab */}
        {activeTab === 'troubleshooting' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {troubleshootingSteps.map((guide, index) => (
              <Card key={index} className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    {guide.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guide.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium">
                          {stepIndex + 1}
                        </div>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" className="w-full">
                      <Book className="h-4 w-4 mr-2" />
                      View Detailed Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recent Support Tickets</h4>
              <Button size="sm" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                New Ticket
              </Button>
            </div>
            
            {supportTickets.map(ticket => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(ticket.category)}
                      <div>
                        <h5 className="font-medium">{ticket.title}</h5>
                        <p className="text-sm text-gray-600">#{ticket.id} • {ticket.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`text-xs border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>
                  {ticket.resolvedAt && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolved {ticket.resolvedAt}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Contact Options */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-blue-200 bg-blue-50">
          <MessageCircle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <h5 className="font-medium text-blue-800">Live Chat</h5>
          <p className="text-xs text-blue-600 mb-2">Average response: 2 min</p>
          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
            Start Chat
          </Button>
        </Card>
        
        <Card className="p-4 text-center border-green-200 bg-green-50">
          <Mail className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <h5 className="font-medium text-green-800">Email Support</h5>
          <p className="text-xs text-green-600 mb-2">Response within 4 hours</p>
          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
            Send Email
          </Button>
        </Card>
        
        <Card className="p-4 text-center border-purple-200 bg-purple-50">
          <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <h5 className="font-medium text-purple-800">Community</h5>
          <p className="text-xs text-purple-600 mb-2">Get help from other users</p>
          <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
            Join Forum
          </Button>
        </Card>
      </div>
    </div>
  );
}