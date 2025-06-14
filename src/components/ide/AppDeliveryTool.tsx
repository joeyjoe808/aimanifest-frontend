import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Download, 
  FileText, 
  Server, 
  Database, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Play,
  Settings,
  Folder,
  Code,
  Terminal,
  Upload,
  HelpCircle,
  BookOpen,
  Monitor,
  Rocket,
  Cloud,
  Zap
} from 'lucide-react';

interface DeploymentPackage {
  id: string;
  name: string;
  type: 'fullstack' | 'frontend' | 'backend' | 'static';
  framework: string;
  status: 'ready' | 'packaging' | 'error';
  size: string;
  files: PackageFile[];
  dependencies: string[];
  deploymentTargets: string[];
  lastUpdated: string;
}

interface PackageFile {
  name: string;
  type: 'code' | 'config' | 'docs' | 'database' | 'assets';
  path: string;
  size: string;
  required: boolean;
}

interface DeploymentTarget {
  id: string;
  name: string;
  type: 'cloud' | 'vps' | 'static' | 'container';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  pricing: 'free' | 'paid' | 'freemium';
  features: string[];
  setupSteps: number;
  deployTime: string;
}

export default function AppDeliveryTool() {
  const [activeTab, setActiveTab] = useState('packaging');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);

  const deploymentPackages: DeploymentPackage[] = [
    {
      id: 'ecommerce-fullstack',
      name: 'E-commerce Platform',
      type: 'fullstack',
      framework: 'Next.js + Node.js',
      status: 'ready',
      size: '24.7 MB',
      files: [
        { name: 'package.json', type: 'config', path: '/', size: '2.1 KB', required: true },
        { name: 'README.md', type: 'docs', path: '/', size: '8.3 KB', required: true },
        { name: 'app/', type: 'code', path: '/src', size: '12.4 MB', required: true },
        { name: 'database.sql', type: 'database', path: '/db', size: '156 KB', required: true },
        { name: 'docker-compose.yml', type: 'config', path: '/', size: '892 B', required: false },
        { name: 'vercel.json', type: 'config', path: '/', size: '234 B', required: false }
      ],
      dependencies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API'],
      deploymentTargets: ['Vercel', 'Netlify', 'Railway', 'Heroku'],
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'portfolio-static',
      name: 'Portfolio Website',
      type: 'static',
      framework: 'React',
      status: 'ready',
      size: '8.2 MB',
      files: [
        { name: 'index.html', type: 'code', path: '/build', size: '4.2 KB', required: true },
        { name: 'assets/', type: 'assets', path: '/build', size: '7.8 MB', required: true },
        { name: 'README.md', type: 'docs', path: '/', size: '3.1 KB', required: true },
        { name: 'deploy.sh', type: 'config', path: '/', size: '567 B', required: false }
      ],
      dependencies: ['React', 'CSS3', 'JavaScript'],
      deploymentTargets: ['Netlify', 'Vercel', 'GitHub Pages', 'Surge'],
      lastUpdated: '5 minutes ago'
    },
    {
      id: 'api-backend',
      name: 'REST API Service',
      type: 'backend',
      framework: 'Express.js',
      status: 'packaging',
      size: '15.3 MB',
      files: [
        { name: 'server.js', type: 'code', path: '/src', size: '8.4 KB', required: true },
        { name: 'routes/', type: 'code', path: '/src', size: '12.1 MB', required: true },
        { name: 'Dockerfile', type: 'config', path: '/', size: '445 B', required: false },
        { name: 'schema.sql', type: 'database', path: '/db', size: '2.8 MB', required: true }
      ],
      dependencies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      deploymentTargets: ['Railway', 'Render', 'DigitalOcean', 'AWS'],
      lastUpdated: '1 minute ago'
    }
  ];

  const deploymentTargets: DeploymentTarget[] = [
    {
      id: 'vercel',
      name: 'Vercel',
      type: 'cloud',
      complexity: 'beginner',
      pricing: 'freemium',
      features: ['Automatic deployments', 'Custom domains', 'SSL certificates', 'Global CDN'],
      setupSteps: 3,
      deployTime: '2-5 minutes'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      type: 'static',
      complexity: 'beginner',
      pricing: 'freemium',
      features: ['Drag & drop deploy', 'Form handling', 'Split testing', 'Edge functions'],
      setupSteps: 2,
      deployTime: '1-3 minutes'
    },
    {
      id: 'railway',
      name: 'Railway',
      type: 'cloud',
      complexity: 'intermediate',
      pricing: 'freemium',
      features: ['Database hosting', 'Auto-scaling', 'Environment variables', 'Custom domains'],
      setupSteps: 4,
      deployTime: '5-10 minutes'
    },
    {
      id: 'heroku',
      name: 'Heroku',
      type: 'cloud',
      complexity: 'intermediate',
      pricing: 'paid',
      features: ['Add-ons marketplace', 'Pipeline deployments', 'Review apps', 'Metrics'],
      setupSteps: 5,
      deployTime: '3-8 minutes'
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean App Platform',
      type: 'cloud',
      complexity: 'intermediate',
      pricing: 'paid',
      features: ['Kubernetes-based', 'Database clusters', 'Load balancing', 'Monitoring'],
      setupSteps: 6,
      deployTime: '8-15 minutes'
    },
    {
      id: 'aws',
      name: 'AWS Amplify',
      type: 'cloud',
      complexity: 'advanced',
      pricing: 'paid',
      features: ['Full AWS integration', 'Lambda functions', 'API Gateway', 'CloudFront CDN'],
      setupSteps: 8,
      deployTime: '10-20 minutes'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'packaging': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-800 border-green-200';
      case 'freemium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'config': return <Settings className="h-4 w-4" />;
      case 'docs': return <FileText className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'assets': return <Folder className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const downloadPackage = async (packageId: string) => {
    console.log(`Downloading package: ${packageId}`);
    // Simulate download
    setDeploymentStatus({
      status: 'downloading',
      message: 'Preparing your application package...',
      progress: 0
    });

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDeploymentStatus({
        status: 'downloading',
        message: `Packaging files... ${i}%`,
        progress: i
      });
    }

    setDeploymentStatus({
      status: 'complete',
      message: 'Package ready for download!',
      progress: 100
    });
  };

  const generateDeploymentGuide = (targetId: string) => {
    const target = deploymentTargets.find(t => t.id === targetId);
    if (!target) return;

    console.log(`Generating deployment guide for ${target.name}`);
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">App Delivery & Deployment</h3>
          <Badge variant="outline" className="text-blue-600">Production Ready</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Project
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packaging">Package Manager</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Targets</TabsTrigger>
          <TabsTrigger value="support">Post-Deploy Support</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials & Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="packaging" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Generated Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deploymentPackages.map(pkg => (
                      <div key={pkg.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{pkg.name}</h4>
                            <p className="text-sm text-gray-600">{pkg.framework}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`border ${getStatusColor(pkg.status)}`}>
                              {pkg.status}
                            </Badge>
                            <span className="text-sm text-gray-500">{pkg.size}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-sm">
                            <span className="font-medium">Files: </span>
                            {pkg.files.filter(f => f.required).length} required, {pkg.files.length - pkg.files.filter(f => f.required).length} optional
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Dependencies: </span>
                            {pkg.dependencies.join(', ')}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Compatible with: </span>
                            {pkg.deploymentTargets.join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => downloadPackage(pkg.id)}
                            disabled={pkg.status !== 'ready'}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedPackage(pkg.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Files
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {selectedPackage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      Package Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deploymentPackages.find(p => p.id === selectedPackage)?.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFileTypeIcon(file.type)}
                            <div>
                              <div className="font-medium text-sm">{file.name}</div>
                              <div className="text-xs text-gray-600">{file.path}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{file.size}</span>
                            {file.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {deploymentStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Package Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{deploymentStatus.message}</span>
                        <span className="text-sm font-medium">{deploymentStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${deploymentStatus.progress}%` }}
                        ></div>
                      </div>
                      {deploymentStatus.status === 'complete' && (
                        <Button className="w-full" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Package
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {deploymentTargets.map(target => (
              <Card key={target.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {target.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`border ${getComplexityColor(target.complexity)}`}>
                        {target.complexity}
                      </Badge>
                      <Badge className={`border ${getPricingColor(target.pricing)}`}>
                        {target.pricing}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Setup Steps: </span>
                        {target.setupSteps}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Deploy Time: </span>
                        {target.deployTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Key Features:</h5>
                      <ul className="text-sm space-y-1">
                        {target.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => generateDeploymentGuide(target.id)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Setup Guide
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Site
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Troubleshooting Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Common Deployment Issues</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Build failures</div>
                          <div className="text-gray-600">Check package.json dependencies and build scripts</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Environment variables</div>
                          <div className="text-gray-600">Ensure all required environment variables are set</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Database connection</div>
                          <div className="text-gray-600">Verify database URL and network access</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Quick Fixes</h4>
                    <div className="space-y-3">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Terminal className="h-4 w-4 mr-2" />
                        Generate Environment Template
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Test Database Connection
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        Validate Domain Setup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Post-Deployment Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Health Checks</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Application Status</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm font-medium">245ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Certificate</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Page Load Speed</span>
                        <span className="text-sm font-medium">1.2s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Core Web Vitals</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SEO Score</span>
                        <span className="text-sm font-medium">94/100</span>
                      </div>
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Full Site Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Deployment Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Beginner Guides</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-blue-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">Deploy to Netlify in 5 minutes</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-blue-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">Vercel deployment walkthrough</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-blue-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">GitHub Pages setup guide</a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Advanced Tutorials</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-purple-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">Custom domain configuration</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-purple-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">CI/CD pipeline setup</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-purple-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">Database migration strategies</a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Platform-Specific</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-green-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">Railway deployment guide</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-orange-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">AWS Amplify setup</a>
                      </li>
                      <li className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">DigitalOcean App Platform</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">README Templates</h4>
                    <p className="text-sm text-gray-600 mb-3">Pre-written documentation for your generated apps</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Copy className="h-4 w-4 mr-2" />
                        Frontend App README
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Copy className="h-4 w-4 mr-2" />
                        Full-Stack App README
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Copy className="h-4 w-4 mr-2" />
                        API Documentation Template
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Setup Scripts</h4>
                    <p className="text-sm text-gray-600 mb-3">Automated setup scripts for common scenarios</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Terminal className="h-4 w-4 mr-2" />
                        Environment Setup Script
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Database Migration Script
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Rocket className="h-4 w-4 mr-2" />
                        Deployment Script
                      </Button>
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