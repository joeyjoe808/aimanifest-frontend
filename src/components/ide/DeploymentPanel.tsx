import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Cloud, Rocket, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  buildLogs?: string[];
  deploymentId?: string;
}

interface DeploymentPanelProps {
  projectId: number;
  projectFiles: { [filename: string]: string };
}

export default function DeploymentPanel({ projectId, projectFiles }: DeploymentPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<'vercel' | 'netlify'>('vercel');
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const deployMutation = useMutation({
    mutationFn: async () => {
      setDeploymentProgress(20);
      const result = await apiRequest(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        body: JSON.stringify({
          target: selectedTarget,
          projectFiles
        })
      });
      setDeploymentProgress(100);
      return result;
    },
    onSuccess: (result) => {
      setDeploymentResult(result);
    },
    onError: (error) => {
      setDeploymentResult({
        success: false,
        error: 'Deployment failed. Please try again.'
      });
    }
  });

  const handleDeploy = () => {
    setDeploymentResult(null);
    setDeploymentProgress(0);
    deployMutation.mutate();
  };

  const getStatusIcon = () => {
    if (deployMutation.isPending) return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    if (deploymentResult?.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (deploymentResult?.error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (deployMutation.isPending) return 'Deploying...';
    if (deploymentResult?.success) return 'Deployed Successfully';
    if (deploymentResult?.error) return 'Deployment Failed';
    return 'Ready to Deploy';
  };

  const getStatusColor = () => {
    if (deployMutation.isPending) return 'secondary';
    if (deploymentResult?.success) return 'default';
    if (deploymentResult?.error) return 'destructive';
    return 'outline';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          One-Click Deploy
          <Badge variant={getStatusColor() as any} className="ml-auto">
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Deployment Target</label>
          <Select value={selectedTarget} onValueChange={(value: 'vercel' | 'netlify') => setSelectedTarget(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vercel">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                  Vercel
                </div>
              </SelectItem>
              <SelectItem value="netlify">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  Netlify
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleDeploy}
          disabled={deployMutation.isPending || Object.keys(projectFiles).length === 0}
          className="w-full"
        >
          {deployMutation.isPending ? 'Deploying...' : `Deploy to ${selectedTarget}`}
        </Button>

        {deployMutation.isPending && (
          <div className="space-y-2">
            <Progress value={deploymentProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Building and deploying your application...
            </p>
          </div>
        )}

        {deploymentResult && (
          <div className="space-y-3">
            {deploymentResult.success ? (
              <div className="space-y-3">
                <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Deployment Successful!</span>
                  </div>
                  {deploymentResult.url && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600">
                        Your application is live at:
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-white rounded border">
                        <code className="text-sm flex-1 truncate">{deploymentResult.url}</code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(deploymentResult.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {deploymentResult.buildLogs && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Build Logs
                    </h4>
                    <div className="p-3 bg-muted rounded-lg text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
                      {deploymentResult.buildLogs.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Deployment Failed</span>
                </div>
                <p className="text-sm text-red-600">
                  {deploymentResult.error || 'An unexpected error occurred during deployment.'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Deployment Features
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Automatic SSL certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Global CDN distribution</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Preview deployments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Zero-downtime deployments</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}