import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Book, 
  Video, 
  Code, 
  Users, 
  Rocket,
  Database,
  Settings,
  Download,
  ExternalLink,
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: 'user-guide' | 'tutorial' | 'api-docs' | 'deployment';
  status: 'draft' | 'published' | 'needs-update';
  lastUpdated: string;
}

export default function DocumentationTool() {
  const [selectedSection, setSelectedSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const documentationSections: DocumentationSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      content: `# Welcome to AI Development Platform

## Quick Start
1. **Create Your First Project**: Click "New Project" and describe what you want to build
2. **Watch AI Build**: See your application being coded in real-time with syntax highlighting
3. **Test Live Preview**: View your app instantly with responsive design testing
4. **Deploy with One Click**: Launch to production with automatic backups and monitoring

## Basic Concepts
- **Natural Language Input**: Describe your app in plain English, including typos and incomplete thoughts
- **Real-time Development**: Watch every line of code being written with file progress tracking
- **Browser-style Interface**: Multiple tabs for different tools and live application preview
- **Production Ready**: Automated testing, security scanning, and deployment preparation`,
      type: 'user-guide',
      status: 'published',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'tutorials',
      title: 'Step-by-Step Tutorials',
      content: `# Video Tutorials

## 1. Creating Your First App (5 min)
📹 Watch how to build a complete todo app from natural language description
- Input: "Build me a todo app with categories and due dates"
- See AI write React components, styling, and functionality
- Test responsive design across devices
- Deploy to production

## 2. Advanced Features (12 min)
📹 Learn about photography apps, e-commerce platforms, and real-time features
- Media handling and file uploads
- Database integration and user authentication
- Payment processing and subscription management
- WebSocket real-time updates

## 3. Testing and Quality Assurance (8 min)
📹 Comprehensive testing workflow
- User flow testing from signup to completion
- Edge case testing with 500 concurrent users
- Security validation and best practices
- Performance monitoring and optimization

## 4. Deployment and Monitoring (10 min)
📹 Production launch preparation
- Environment configuration and SSL setup
- Automatic backups and rollback procedures
- Real-time analytics and error tracking
- Scaling and performance optimization`,
      type: 'tutorial',
      status: 'published',
      lastUpdated: '1 day ago'
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      content: `# API Reference

## Authentication
All API requests require authentication via session cookies or JWT tokens.

\`\`\`javascript
// Example authentication
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
\`\`\`

## Project Management
### Create Project
\`POST /api/projects\`

\`\`\`json
{
  "name": "My App",
  "description": "A social media app with real-time chat",
  "type": "web-app"
}
\`\`\`

### Get Project Status
\`GET /api/projects/:id/status\`

Returns build status, deployment info, and performance metrics.

## AI Agent Interaction
### Send Development Request
\`POST /api/ai/generate\`

\`\`\`json
{
  "projectId": 123,
  "prompt": "Add user authentication with email verification",
  "context": "existing-auth-system"
}
\`\`\`

### Real-time Updates
WebSocket connection at \`ws://localhost:5000\` provides:
- Live code generation updates
- Build progress notifications
- Deployment status changes
- Performance metrics

## Database Schema
### Users Table
- id: Primary key
- username: Unique identifier
- email: Contact information
- createdAt: Registration timestamp

### Projects Table  
- id: Primary key
- userId: Foreign key to users
- name: Project display name
- description: Project overview
- files: JSON object with generated code
- isPublic: Visibility setting`,
      type: 'api-docs',
      status: 'published',
      lastUpdated: '3 hours ago'
    },
    {
      id: 'deployment-guide',
      title: 'Deployment Instructions',
      content: `# Deployment Guide

## Development Environment Setup
\`\`\`bash
# Clone repository
git clone https://github.com/your-org/ai-dev-platform.git
cd ai-dev-platform

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
\`\`\`

## Production Deployment

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- SSL certificates
- Domain name

### Environment Variables
\`\`\`env
DATABASE_URL=postgresql://user:password@your-db-host:5432/aidev
OPENAI_API_KEY=your_openai_key
SESSION_SECRET=random_string_here
NODE_ENV=production
\`\`\`

### Build and Deploy
\`\`\`bash
# Build application
npm run build

# Push database schema
npm run db:push

# Start production server
npm start
\`\`\`

### Docker Deployment
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

### Health Checks
- \`GET /health\` - Basic service status
- \`GET /api/status\` - Detailed system metrics
- Database connectivity verification
- External API availability testing

### Monitoring Setup
Configure alerts for:
- Response time > 2 seconds
- Error rate > 1%
- Database connection issues
- Memory usage > 80%`,
      type: 'deployment',
      status: 'published',
      lastUpdated: '5 hours ago'
    }
  ];

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs-update': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user-guide': return <Users className="h-4 w-4" />;
      case 'tutorial': return <Video className="h-4 w-4" />;
      case 'api-docs': return <Code className="h-4 w-4" />;
      case 'deployment': return <Rocket className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Documentation Center</h3>
          <Badge variant="outline" className="text-blue-600">Live Documentation</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Docs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Documentation Navigation */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation Sections
          </h4>
          
          <div className="space-y-2">
            {filteredSections.map(section => (
              <Card 
                key={section.id} 
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSection === section.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(section.type)}
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  <Badge className={`text-xs border ${getStatusColor(section.status)}`}>
                    {section.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Updated {section.lastUpdated}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Book className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Quick Stats</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Sections:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span>Video Tutorials:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span>API Endpoints:</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">Today</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Documentation Content */}
        <div className="lg:col-span-3 space-y-4">
          {selectedSection && (
            <Card className="flex-1">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(filteredSections.find(s => s.id === selectedSection)?.type || '')}
                    <CardTitle>
                      {filteredSections.find(s => s.id === selectedSection)?.title}
                    </CardTitle>
                    <Badge className={`border ${getStatusColor(filteredSections.find(s => s.id === selectedSection)?.status || '')}`}>
                      {filteredSections.find(s => s.id === selectedSection)?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {filteredSections.find(s => s.id === selectedSection)?.content}
                  </pre>
                </div>
                
                {selectedSection === 'tutorials' && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Card className="p-4 border-green-200 bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Interactive Tutorial</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Try our guided walkthrough that builds a real app step by step.
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Start Tutorial
                      </Button>
                    </Card>
                    
                    <Card className="p-4 border-purple-200 bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800">Video Library</span>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        Watch comprehensive video tutorials covering all features.
                      </p>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Watch Videos
                      </Button>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedSection && (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Select Documentation Section</h3>
              <p className="text-gray-600 mb-4">
                Choose a section from the left sidebar to view comprehensive documentation
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>User guides</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>Video tutorials</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span>API reference</span>
                </div>
                <div className="flex items-center gap-1">
                  <Rocket className="h-4 w-4" />
                  <span>Deployment guides</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}