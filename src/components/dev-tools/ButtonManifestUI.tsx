import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Zap, Code, FileText } from 'lucide-react';

interface ButtonMeta {
  label: string;
  function: string;
  backendRoute: string;
  component: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  category?: string;
  description?: string;
}

interface ButtonManifest {
  pageName: string;
  buttons: ButtonMeta[];
  generatedAt: string;
  buttonCount: number;
}

export default function ButtonManifestUI() {
  const [pageName, setPageName] = useState('');
  const [manifest, setManifest] = useState<ButtonManifest | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const scanButtons = async () => {
    if (!pageName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page name",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      const response = await apiRequest('POST', '/api/dev-tools/scan-buttons', {
        pageName: pageName.trim()
      });

      setManifest(response as ButtonManifest);
      toast({
        title: "Success",
        description: `Found ${response.buttonCount} buttons in ${pageName}`,
      });
    } catch (error) {
      toast({
        title: "Scanning Failed",
        description: error instanceof Error ? error.message : "Failed to scan buttons",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const generateWithAI = async () => {
    if (!pageName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a page name first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-button-manifest', {
        pageName: pageName.trim(),
        description: `Generate comprehensive button manifest for ${pageName} page`
      });

      toast({
        title: "AI Generation Started",
        description: response.message,
      });

      // Poll for results or refresh manifest
      setTimeout(async () => {
        try {
          await scanButtons(); // Refresh to get the AI-generated manifest
        } catch (e) {
          console.log('Auto-refresh failed, user can manually refresh');
        }
      }, 3000);

    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate AI manifest",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const autoLinkButtons = async () => {
    if (!manifest) {
      toast({
        title: "Error",
        description: "Please scan or generate a manifest first",
        variant: "destructive"
      });
      return;
    }

    setIsLinking(true);
    try {
      const response = await apiRequest('POST', '/api/ai/auto-link-buttons', {
        pageName: manifest.pageName,
        manifestData: manifest
      });

      toast({
        title: "Auto-Linking Started",
        description: response.message,
      });

    } catch (error) {
      toast({
        title: "Auto-Linking Failed",
        description: error instanceof Error ? error.message : "Failed to auto-link buttons",
        variant: "destructive"
      });
    } finally {
      setIsLinking(false);
    }
  };

  const generateRoutes = async () => {
    if (!manifest) {
      toast({
        title: "Error",
        description: "Please scan buttons first to generate routes",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/dev-tools/generate-routes', {
        manifest
      });

      toast({
        title: "Routes Generated",
        description: `Generated ${response.routeFiles?.length || 0} route files and ${response.frontendActions?.length || 0} frontend actions`,
      });
    } catch (error) {
      toast({
        title: "Route Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate routes",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Button Manifest Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter page name (e.g., 'Dashboard', 'Workspace')"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && scanButtons()}
            />
            <Button onClick={scanButtons} disabled={isScanning}>
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Scan
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateWithAI} disabled={isGenerating} variant="outline">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              AI Generate
            </Button>
            <Button onClick={autoLinkButtons} disabled={isLinking || !manifest} variant="outline">
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code className="h-4 w-4" />}
              Auto-Link
            </Button>
            <Button onClick={generateRoutes} disabled={!manifest} variant="outline">
              <FileText className="h-4 w-4" />
              Generate Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {manifest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Button Manifest: {manifest.pageName}</span>
              <Badge variant="secondary">{manifest.buttonCount} buttons</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Generated: {new Date(manifest.generatedAt).toLocaleString()}
              </div>
              <Separator />
              <div className="space-y-3">
                {manifest.buttons.map((button, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{button.label}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{button.httpMethod}</Badge>
                        {button.category && (
                          <Badge variant="secondary">{button.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Function:</span> {button.function}</div>
                      <div><span className="font-medium">Route:</span> {button.backendRoute}</div>
                      <div><span className="font-medium">Component:</span> {button.component}</div>
                      {button.description && (
                        <div><span className="font-medium">Description:</span> {button.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}