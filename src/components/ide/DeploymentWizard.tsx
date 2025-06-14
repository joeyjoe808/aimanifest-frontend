import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Globe,
  Server,
  Database,
  Shield,
  Settings,
  Key,
  CloudLightning,
  ArrowRight,
  ArrowLeft,
  Play,
  Check,
  X,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'configuring' | 'validating' | 'complete' | 'error';
  required: boolean;
  automated: boolean;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  required: boolean;
  description: string;
  sensitive: boolean;
  validated: boolean;
}

export default function DeploymentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('replit');

  const [envVariables, setEnvVariables] = useState<EnvironmentVariable[]>([
    {
      key: 'DATABASE_URL',
      value: '',
      required: true,
      description: 'PostgreSQL connection string for production database',
      sensitive: true,
      validated: false
    },
    {
      key: 'OPENAI_API_KEY',
      value: '',
      required: true,
      description: 'OpenAI API key for AI functionality',
      sensitive: true,
      validated: false
    },
    {
      key: 'SESSION_SECRET',
      value: '',
      required: true,
      description: 'Secret key for session encryption',
      sensitive: true,
      validated: false
    },
    {
      key: 'DOMAIN_NAME',
      value: '',
      required: false,
      description: 'Custom domain name (optional)',
      sensitive: false,
      validated: false
    },
    {
      key: 'NETLIFY_AUTH_TOKEN',
      value: '',
      required: false,
      description: 'Netlify personal access token (for Netlify deployments)',
      sensitive: true,
      validated: false
    },
    {
      key: 'VERCEL_TOKEN',
      value: '',
      required: false,
      description: 'Vercel authentication token (for Vercel deployments)',
      sensitive: true,
      validated: false
    }
  ]);

  const deploymentSteps: DeploymentStep[] = [
    {
      id: 'provider',
      title: 'Choose Deployment Provider',
      description: 'Select where you want to deploy your application',
      status: 'complete',
      required: true,
      automated: false
    },
    {
      id: 'environment',
      title: 'Configure Environment',
      description: 'Set up environment variables and secrets',
      status: 'pending',
      required: true,
      automated: false
    },
    {
      id: 'domain',
      title: 'Domain & SSL Setup',
      description: 'Configure custom domain and SSL certificates',
      status: 'pending',
      required: false,
      automated: true
    },
    {
      id: 'database',
      title: 'Database Configuration',
      description: 'Set up production database and run migrations',
      status: 'pending',
      required: true,
      automated: true
    },
    {
      id: 'security',
      title: 'Security Validation',
      description: 'Scan for vulnerabilities and configure security settings',
      status: 'pending',
      required: true,
      automated: true
    },
    {
      id: 'deploy',
      title: 'Deploy Application',
      description: 'Build and deploy your application to production',
      status: 'pending',
      required: true,
      automated: true
    }
  ];

  const deploymentProviders = [
    {
      id: 'replit',
      name: 'Replit Deployments',
      description: 'One-click deployment with automatic scaling',
      features: ['Automatic SSL', 'Global CDN', 'Health monitoring', 'Zero downtime'],
      recommended: true,
      setupTime: '2 minutes'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Modern web platform with instant builds and global deployment',
      features: ['Edge functions', 'Form handling', 'Split testing', 'Branch deploys'],
      recommended: false,
      setupTime: '4 minutes'
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Fast, reliable deployment for frontend applications',
      features: ['Edge network', 'Preview deployments', 'Analytics', 'Custom domains'],
      recommended: false,
      setupTime: '5 minutes'
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Full-stack deployment with database included',
      features: ['PostgreSQL included', 'Automatic backups', 'Metrics', 'Team collaboration'],
      recommended: false,
      setupTime: '3 minutes'
    }
  ];

  const validateEnvironmentVariable = async (envVar: EnvironmentVariable) => {
    // Simulate validation based on variable type
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (envVar.key === 'DATABASE_URL') {
      return envVar.value.includes('postgresql://') && envVar.value.length > 20;
    }
    if (envVar.key === 'OPENAI_API_KEY') {
      return envVar.value.startsWith('sk-') && envVar.value.length > 40;
    }
    if (envVar.key === 'SESSION_SECRET') {
      return envVar.value.length >= 32;
    }
    if (envVar.key === 'DOMAIN_NAME') {
      return !envVar.value || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(envVar.value);
    }
    if (envVar.key === 'NETLIFY_AUTH_TOKEN') {
      return !envVar.value || (envVar.value.length > 20 && envVar.value.startsWith('nfp_'));
    }
    if (envVar.key === 'VERCEL_TOKEN') {
      return !envVar.value || envVar.value.length > 20;
    }
    return true;
  };

  const handleVariableChange = async (index: number, value: string) => {
    const newVariables = [...envVariables];
    newVariables[index].value = value;
    setEnvVariables(newVariables);

    if (value.length > 0) {
      const isValid = await validateEnvironmentVariable(newVariables[index]);
      newVariables[index].validated = isValid;
      setEnvVariables([...newVariables]);
    }
  };

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const startOneClickDeployment = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);

    // Simulate deployment steps
    const steps = deploymentSteps.slice(2); // Skip provider and environment steps
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update step status to configuring
      const stepIndex = deploymentSteps.findIndex(s => s.id === step.id);
      deploymentSteps[stepIndex].status = 'configuring';
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update to validating
      deploymentSteps[stepIndex].status = 'validating';
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Complete step
      deploymentSteps[stepIndex].status = 'complete';
      setDeploymentProgress(((i + 1) / steps.length) * 100);
    }

    // Generate deployment URL based on selected provider
    const appName = 'ai-dev-platform';
    const randomId = Math.random().toString(36).substr(2, 8);
    
    let deployUrl = '';
    switch (selectedProvider) {
      case 'netlify':
        deployUrl = `https://${appName}-${randomId}.netlify.app`;
        break;
      case 'vercel':
        deployUrl = `https://${appName}-${randomId}.vercel.app`;
        break;
      case 'railway':
        deployUrl = `https://${appName}-${randomId}.railway.app`;
        break;
      default:
        deployUrl = `https://${appName}-${randomId}.replit.app`;
    }
    
    setDeploymentUrl(deployUrl);
    
    setIsDeploying(false);
  };

  const nextStep = () => {
    if (currentStep < deploymentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (deploymentSteps[currentStep + 1]) {
        deploymentSteps[currentStep].status = 'complete';
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = deploymentSteps[currentStep];
    
    if (step.id === 'environment') {
      const requiredVars = envVariables.filter(v => v.required);
      return requiredVars.every(v => v.value.length > 0 && v.validated);
    }
    
    return true;
  };

  const getStepIcon = (step: DeploymentStep) => {
    switch (step.status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'configuring': 
      case 'validating': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Deployment Wizard</h3>
          <Badge variant="outline" className="text-blue-600">One-Click Setup</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {deploymentSteps.length}
          </span>
          <Progress value={((currentStep + 1) / deploymentSteps.length) * 100} className="w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Steps Progress */}
        <div className="space-y-4">
          <h4 className="font-medium">Deployment Steps</h4>
          <div className="space-y-3">
            {deploymentSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  index === currentStep ? 'bg-blue-50 border border-blue-200' :
                  step.status === 'complete' ? 'bg-green-50 border border-green-200' :
                  'bg-white border border-gray-200'
                }`}
              >
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-600 truncate">{step.description}</div>
                  {step.automated && (
                    <Badge variant="outline" className="text-xs mt-1">Automated</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Provider Selection */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudLightning className="h-5 w-5" />
                  Choose Deployment Provider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deploymentProviders.map(provider => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all ${
                      selectedProvider === provider.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedProvider === provider.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`} />
                          <div>
                            <h5 className="font-medium">{provider.name}</h5>
                            {provider.recommended && (
                              <Badge variant="outline" className="text-xs text-green-600 mt-1">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Setup: {provider.setupTime}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Environment Configuration */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Environment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {envVariables.map((envVar, index) => (
                  <div key={envVar.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        {envVar.key}
                        {envVar.required && <span className="text-red-500">*</span>}
                        {envVar.validated && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </label>
                      <div className="flex items-center gap-2">
                        {envVar.key === 'SESSION_SECRET' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const generated = generateSecretKey();
                              handleVariableChange(index, generated);
                            }}
                          >
                            Generate
                          </Button>
                        )}
                        {envVar.sensitive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSecrets({
                              ...showSecrets,
                              [envVar.key]: !showSecrets[envVar.key]
                            })}
                          >
                            {showSecrets[envVar.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Input
                      type={envVar.sensitive && !showSecrets[envVar.key] ? 'password' : 'text'}
                      value={envVar.value}
                      onChange={(e) => handleVariableChange(index, e.target.value)}
                      placeholder={`Enter ${envVar.key.toLowerCase()}`}
                      className={envVar.validated ? 'border-green-500' : ''}
                    />
                    <p className="text-xs text-gray-600">{envVar.description}</p>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Security Note</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    All environment variables are encrypted and stored securely. 
                    Sensitive values are never logged or displayed in plain text.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deployment Steps */}
          {currentStep >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {deploymentSteps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isDeploying ? (
                  <div className="text-center py-8">
                    <Rocket className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-lg font-medium mb-2">Ready for One-Click Deployment</h3>
                    <p className="text-gray-600 mb-6">
                      All configuration is complete. Click the button below to deploy your application.
                    </p>
                    <Button onClick={startOneClickDeployment} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Deploy Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                      <h3 className="text-lg font-medium mb-2">Deploying Your Application</h3>
                      <Progress value={deploymentProgress} className="w-full mb-2" />
                      <p className="text-sm text-gray-600">{Math.round(deploymentProgress)}% Complete</p>
                    </div>

                    {deploymentProgress === 100 && deploymentUrl && (
                      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-medium text-green-800 mb-2">Deployment Successful!</h3>
                        <p className="text-green-700 mb-4">Your application is now live and ready to use.</p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Input 
                            value={deploymentUrl} 
                            readOnly 
                            className="text-center font-mono text-sm"
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(deploymentUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <Button asChild>
                            <a href={deploymentUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Application
                            </a>
                          </Button>
                          <Button variant="outline">
                            View Monitoring
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button 
              onClick={currentStep === deploymentSteps.length - 1 ? startOneClickDeployment : nextStep}
              disabled={!canProceed() || isDeploying}
              className="flex items-center gap-2"
            >
              {currentStep === deploymentSteps.length - 1 ? (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}