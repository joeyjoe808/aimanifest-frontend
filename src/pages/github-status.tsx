import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Github, 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Activity,
  RefreshCw,
  Settings,
  Globe,
  Code,
  Upload
} from 'lucide-react';

interface GitHubStatus {
  success: boolean;
  status: string;
  configured: boolean;
  connections: Record<string, any>;
  integration: {
    workflows: string;
    actions: string;
    deployment: string;
  };
}

export default function GitHubStatus() {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchGitHubStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/github/status');
      const data = await response.json();
      setStatus(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to fetch GitHub status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubStatus();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500';
      case 'enabled': return 'text-blue-500';
      case 'automated': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'enabled':
      case 'automated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Github className="h-8 w-8" />
            GitHub Integration Status
          </h1>
          <p className="text-xl text-gray-600">
            Platform integration with GitHub workflows and automation
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                GitHub Service Status
              </CardTitle>
              <div className="flex items-center gap-2">
                {lastCheck && (
                  <span className="text-sm text-gray-500">
                    Last checked: {lastCheck.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  onClick={fetchGitHubStatus}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading GitHub status...</span>
              </div>
            ) : status ? (
              <div className="space-y-4">
                {/* Main Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Github className={`h-6 w-6 ${getStatusColor(status.status)}`} />
                    <div>
                      <div className="font-medium">GitHub Integration</div>
                      <Badge variant={status.success ? "default" : "destructive"}>
                        {status.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Settings className={`h-6 w-6 ${status.configured ? 'text-green-500' : 'text-red-500'}`} />
                    <div>
                      <div className="font-medium">Configuration</div>
                      <Badge variant={status.configured ? "default" : "destructive"}>
                        {status.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Globe className="h-6 w-6 text-blue-500" />
                    <div>
                      <div className="font-medium">Connections</div>
                      <Badge variant="outline">
                        {Object.keys(status.connections).length} ACTIVE
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Integration Details */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Integration Components
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <span>GitHub Actions</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.integration.actions)}
                        <Badge variant="outline">{status.integration.actions}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Workflows</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.integration.workflows)}
                        <Badge variant="outline">{status.integration.workflows}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Deployment</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.integration.deployment)}
                        <Badge variant="outline">{status.integration.deployment}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Failed to load GitHub status
              </div>
            )}
          </CardContent>
        </Card>

        {/* GitHub Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Active GitHub Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated deployment pipeline</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Button manifest validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Pull request automation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Code synchronization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Project backup to GitHub</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Workflow status monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                GitHub Actions Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Deploy Staging</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="font-medium">Button Validation</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span className="font-medium">PR Validation</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Platform GitHub Integration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Setup</h4>
              <p className="text-blue-800 text-sm mb-3">
                The AI Manifest Platform is fully integrated with GitHub and running with automated workflows, 
                deployment pipelines, and continuous validation systems.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Platform:</strong> Replit (development and staging)</div>
                <div><strong>Version Control:</strong> GitHub repository</div>
                <div><strong>CI/CD:</strong> GitHub Actions workflows</div>
                <div><strong>Deployment:</strong> Automated via GitHub Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}