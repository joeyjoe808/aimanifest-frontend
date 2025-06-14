import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Server, 
  Shield, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Loader2,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Globe,
  Lock
} from 'lucide-react';

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  duration: number;
  details: string[];
}

interface EnvironmentConfig {
  name: string;
  url: string;
  status: 'healthy' | 'warning' | 'error';
  lastDeploy: string;
  version: string;
}

export default function DeploymentTool() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('staging');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const environments: EnvironmentConfig[] = [
    {
      name: 'Staging',
      url: 'https://staging.myapp.com',
      status: 'healthy',
      lastDeploy: '2 hours ago',
      version: 'v1.2.3-rc.1'
    },
    {
      name: 'Production',
      url: 'https://myapp.com',
      status: 'healthy',
      lastDeploy: '1 day ago',
      version: 'v1.2.2'
    },
    {
      name: 'Development',
      url: 'https://dev.myapp.com',
      status: 'warning',
      lastDeploy: '30 minutes ago',
      version: 'v1.2.4-dev'
    }
  ];

  const initializeDeploymentSteps = () => {
    return [
      {
        id: 'security-scan',
        name: 'Security Scan',
        description: 'Scanning for vulnerabilities and security issues',
        status: 'pending' as const,
        duration: 0,
        details: [
          'Dependency vulnerability check',
          'Code security analysis',
          'Environment variable validation',
          'SSL certificate verification'
        ]
      },
      {
        id: 'build',
        name: 'Build Application',
        description: 'Compiling and bundling the application',
        status: 'pending' as const,
        duration: 0,
        details: [
          'TypeScript compilation',
          'Asset optimization',
          'Bundle analysis',
          'Source map generation'
        ]
      },
      {
        id: 'test',
        name: 'Run Tests',
        description: 'Executing automated test suite',
        status: 'pending' as const,
        duration: 0,
        details: [
          'Unit tests (458 tests)',
          'Integration tests (67 tests)',
          'End-to-end tests (23 tests)',
          'Performance benchmarks'
        ]
      },
      {
        id: 'backup',
        name: 'Create Backup',
        description: 'Backing up current deployment',
        status: 'pending' as const,
        duration: 0,
        details: [
          'Database snapshot',
          'File system backup',
          'Configuration backup',
          'Rollback point creation'
        ]
      },
      {
        id: 'deploy',
        name: 'Deploy to Server',
        description: 'Uploading and configuring new version',
        status: 'pending' as const,
        duration: 0,
        details: [
          'File upload to server',
          'Database migrations',
          'Service restart',
          'Health check verification'
        ]
      },
      {
        id: 'monitor',
        name: 'Post-Deploy Monitoring',
        description: 'Verifying deployment success',
        status: 'pending' as const,
        duration: 0,
        details: [
          'Response time check',
          'Error rate monitoring',
          'Resource usage validation',
          'User notification system'
        ]
      }
    ];
  };

  const startDeployment = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    setCurrentStep(0);
    const steps = initializeDeploymentSteps();
    setDeploymentSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step to running
      setDeploymentSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' } : step
      ));

      // Simulate step execution
      const stepDuration = Math.random() * 3000 + 2000; // 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      // Update step to complete
      setDeploymentSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'complete', duration: Math.round(stepDuration / 1000) } : step
      ));

      setDeploymentProgress((i + 1) / steps.length * 100);
    }

    setIsDeploying(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Deployment Preparation</h3>
          <Badge variant="outline" className="text-purple-600">Production Ready</Badge>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedEnvironment} 
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="staging">Staging Environment</option>
            <option value="production">Production Environment</option>
            <option value="development">Development Environment</option>
          </select>
          <Button 
            onClick={startDeployment} 
            disabled={isDeploying}
            className="flex items-center gap-2"
          >
            {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isDeploying ? 'Deploying...' : 'Start Deployment'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Environment Status */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Environment Status
          </h4>
          
          {environments.map(env => (
            <Card key={env.name} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{env.name}</span>
                </div>
                <Badge className={`text-xs border ${getStatusColor(env.status)}`}>
                  {env.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>URL: {env.url}</div>
                <div>Version: {env.version}</div>
                <div>Last Deploy: {env.lastDeploy}</div>
              </div>
            </Card>
          ))}

          <Card className="p-4 border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Security Checklist</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>SSL certificates valid</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Environment variables secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Dependencies up to date</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Backup system configured</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Deployment Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Deployment Pipeline</h4>
            {isDeploying && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600">
                  Step {currentStep + 1} of {deploymentSteps.length}
                </span>
              </div>
            )}
          </div>

          {isDeploying && (
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-blue-600">{Math.round(deploymentProgress)}%</span>
              </div>
              <Progress value={deploymentProgress} className="w-full" />
            </Card>
          )}

          <div className="space-y-3">
            {deploymentSteps.map((step, index) => (
              <Card key={step.id} className={`p-4 transition-all duration-300 ${
                step.status === 'running' ? 'border-blue-500 bg-blue-50' : 
                step.status === 'complete' ? 'border-green-500 bg-green-50' :
                step.status === 'failed' ? 'border-red-500 bg-red-50' : ''
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>
                  {step.duration > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {step.duration}s
                    </Badge>
                  )}
                </div>
                
                {step.status === 'running' && (
                  <div className="mt-3">
                    <div className="space-y-1">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step.status === 'complete' && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ All checks passed successfully
                  </div>
                )}
              </Card>
            ))}
          </div>

          {!isDeploying && deploymentSteps.length === 0 && (
            <Card className="p-8 text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Ready for Deployment</h3>
              <p className="text-gray-600 mb-4">
                Configure your target environment and start the deployment process
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  <span>Automatic backups</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>Rollback ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Health monitoring</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}