import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Scan, Code, Download } from 'lucide-react';

interface ButtonManifest {
  id: string;
  label: string;
  function: string;
  backendRoute: string;
  updatesState: string[];
  loadingStates: boolean;
  errorHandling: boolean;
  usesWebSocket: boolean;
  description: string;
}

interface ScanResult {
  componentName: string;
  buttons: ButtonManifest[];
  generatedAt: string;
  totalButtons: number;
}

export default function ButtonManifestScanner() {
  const [sourceCode, setSourceCode] = useState('');
  const [componentName, setComponentName] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ backendRoutes: string; frontendActions: string } | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [claudePrompt, setClaudePrompt] = useState<string>('');
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: async (data: { sourceCode: string; componentName: string }) => {
      return apiRequest('POST', '/api/scan-component-buttons', data);
    },
    onSuccess: (response) => {
      setScanResult(response.data);
      toast({
        title: "Scan Complete",
        description: response.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (manifests: ButtonManifest[]) => {
      return apiRequest('POST', '/api/generate-routes-from-manifest', { manifests });
    },
    onSuccess: (response) => {
      setGeneratedCode(response.data);
      toast({
        title: "Code Generated",
        description: response.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (manifests: ButtonManifest[]) => {
      return apiRequest('POST', '/api/validate-manifests', { manifests });
    },
    onSuccess: (response) => {
      setValidationResult(response.data);
      toast({
        title: "Validation Complete",
        description: response.message,
        variant: response.data.validation.isValid ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const promptMutation = useMutation({
    mutationFn: async (data: { sourceCode: string; componentName: string; type: string }) => {
      return apiRequest('POST', '/api/generate-claude-prompt', data);
    },
    onSuccess: (response) => {
      setClaudePrompt(response.data.prompt);
      toast({
        title: "Claude Prompt Generated",
        description: `${response.data.tokenEstimate} estimated tokens`,
      });
    },
    onError: (error) => {
      toast({
        title: "Prompt Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = () => {
    if (!sourceCode.trim()) {
      toast({
        title: "Error",
        description: "Please provide source code to scan",
        variant: "destructive",
      });
      return;
    }
    scanMutation.mutate({ sourceCode, componentName: componentName || 'Component' });
  };

  const handleGenerateCode = () => {
    if (!scanResult?.buttons.length) {
      toast({
        title: "Error",
        description: "No button manifests to generate code from",
        variant: "destructive",
      });
      return;
    }
    generateCodeMutation.mutate(scanResult.buttons);
  };

  const handleValidateManifests = () => {
    if (!scanResult?.buttons.length) {
      toast({
        title: "Error",
        description: "No button manifests to validate",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate(scanResult.buttons);
  };

  const handleGenerateClaudePrompt = () => {
    if (!sourceCode.trim()) {
      toast({
        title: "Error",
        description: "Please provide source code for Claude prompt generation",
        variant: "destructive",
      });
      return;
    }
    promptMutation.mutate({
      sourceCode,
      componentName: componentName || 'Component',
      type: 'scan'
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    });
  };

  const downloadJSON = () => {
    if (!scanResult) return;
    const dataStr = JSON.stringify(scanResult.buttons, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scanResult.componentName}-button-manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sample component code for demonstration
  const sampleCode = `import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h1>User Management</h1>
      <Button id="fetchUsersBtn" onClick={fetchUsers}>
        Fetch Users
      </Button>
      <Button id="createUserBtn" onClick={createUser}>
        Create User
      </Button>
      <Button id="deleteUserBtn" onClick={deleteUser} variant="destructive">
        Delete User
      </Button>
      <Button id="exportDataBtn" onClick={exportData}>
        Export Data
      </Button>
    </div>
  );
}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enterprise Button Manifest Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Scan React/TypeScript components and generate comprehensive button manifests with backend routes and frontend actions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Component Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Component Name</label>
                <Input
                  placeholder="e.g., UserManagement"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">React/TypeScript Source Code</label>
                <Textarea
                  placeholder="Paste your React component code here..."
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleScan}
                  disabled={scanMutation.isPending}
                  className="flex-1"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {scanMutation.isPending ? 'Scanning...' : 'Scan Component'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSourceCode(sampleCode)}
                >
                  Load Sample
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateClaudePrompt}
                  disabled={promptMutation.isPending}
                >
                  {promptMutation.isPending ? 'Generating...' : 'Claude Prompt'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scan Results</span>
                {scanResult && (
                  <Badge variant="secondary">
                    {scanResult.totalButtons} buttons found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!scanResult ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No scan results yet. Scan a component to see button manifests.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Component: {scanResult.componentName}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadJSON}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(scanResult.buttons, null, 2), 'Manifest JSON')}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {scanResult.buttons.map((button, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{button.label}</h4>
                          <Badge variant={button.usesWebSocket ? "default" : "secondary"}>
                            {button.usesWebSocket ? 'WebSocket' : 'REST'}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>ID:</strong> {button.id}</div>
                          <div><strong>Function:</strong> {button.function}</div>
                          <div><strong>Route:</strong> {button.backendRoute}</div>
                          <div><strong>State Updates:</strong> {button.updatesState.join(', ') || 'None'}</div>
                          <div><strong>Loading:</strong> {button.loadingStates ? 'Yes' : 'No'}</div>
                          <div className="text-gray-600 dark:text-gray-300">{button.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleValidateManifests}
                      disabled={validateMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      {validateMutation.isPending ? 'Validating...' : 'Validate Manifests'}
                    </Button>
                    <Button
                      onClick={handleGenerateCode}
                      disabled={generateCodeMutation.isPending}
                      className="flex-1"
                    >
                      {generateCodeMutation.isPending ? 'Generating...' : 'Generate Code'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Validation Results Section */}
        {validationResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Validation Results</span>
                <Badge variant={validationResult.validation.isValid ? "default" : "destructive"}>
                  {validationResult.validation.isValid ? '✅ Valid' : '❌ Invalid'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Buttons</div>
                    <div className="text-2xl font-bold">{validationResult.validation.stats.totalButtons}</div>
                  </div>
                  <div>
                    <div className="font-medium">Unique IDs</div>
                    <div className="text-2xl font-bold">{validationResult.validation.stats.uniqueIds}</div>
                  </div>
                  <div>
                    <div className="font-medium">WebSocket</div>
                    <div className="text-2xl font-bold">{validationResult.validation.stats.websocketButtons}</div>
                  </div>
                  <div>
                    <div className="font-medium">Loading States</div>
                    <div className="text-2xl font-bold">{validationResult.validation.stats.loadingButtons}</div>
                  </div>
                </div>

                {validationResult.validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600 dark:text-red-400">Errors:</h4>
                    {validationResult.validation.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {validationResult.validation.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Warnings:</h4>
                    {validationResult.validation.warnings.map((warning: string, index: number) => (
                      <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(validationResult.report, 'Validation report')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Report
                  </Button>
                  {!validationResult.validation.isValid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(validationResult.fixedManifests, null, 2), 'Fixed manifests')}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Fixed JSON
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claude Prompt Section */}
        {claudePrompt && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Claude Prompt (Optimized for AI Scanning)</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{Math.ceil(claudePrompt.length / 4)} tokens</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(claudePrompt, 'Claude prompt')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">{claudePrompt}</pre>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📋 Usage Instructions:</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Copy the prompt above</li>
                  <li>2. Paste it into Claude (or any AI model)</li>
                  <li>3. The AI will return structured JSON with button manifests</li>
                  <li>4. Use the validation feature to check the results</li>
                  <li>5. Generate backend routes and frontend actions from validated manifests</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Code Section */}
        {generatedCode && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Backend Routes</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCode.backendRoutes, 'Backend code')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {generatedCode.backendRoutes}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Frontend Actions</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCode.frontendActions, 'Frontend code')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {generatedCode.frontendActions}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}