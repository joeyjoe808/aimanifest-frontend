import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PlayCircle, Code, Database, Zap, CheckCircle, Activity, Wifi, WifiOff } from 'lucide-react';
import { useAIWebSocket } from '@/hooks/useAIWebSocket';

interface ProcessingResult {
  success: boolean;
  code?: {
    backend: string;
    frontend: string;
    tests: string;
  };
  error?: string;
  manifest: any[];
  timestamp: string;
}

export default function UnifiedManifestDemo() {
  const [componentCode, setComponentCode] = useState(`// Enhanced React component with smart manifests
function ProductCatalog() {
  const [products, setProducts] = useState([]);
  
  return (
    <div className="catalog">
      <button 
        data-manifest='{"id": "load-products", "label": "Load Products", "action": "fetchProducts", "description": "Fetch product catalog from API", "data": {"endpoint": "/api/products", "method": "GET", "params": {"category": "string", "limit": "number"}}, "realtime": true, "socketEvent": "products:updated"}'
        onClick={() => console.log('Loading products...')}
      >
        Load Products
      </button>
      
      <button 
        data-manifest='{"id": "add-product", "label": "Add Product", "action": "createProduct", "description": "Create new product entry", "data": {"endpoint": "/api/products", "method": "POST", "params": {"name": "string", "price": "number", "category": "string"}}, "realtime": true, "socketEvent": "product:created"}'
        onClick={() => console.log('Adding product...')}
      >
        Add Product
      </button>
      
      <button 
        data-manifest='{"id": "sync-inventory", "label": "Sync Inventory", "action": "syncInventory", "description": "Synchronize inventory data", "data": {"endpoint": "/api/inventory/sync", "method": "POST", "params": {"store_id": "string"}}, "realtime": true, "socketEvent": "inventory:synced"}'
        onClick={() => console.log('Syncing inventory...')}
      >
        Sync Inventory
      </button>
    </div>
  );
}`);

  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();
  const { isConnected, messages } = useAIWebSocket();

  // Listen for WebSocket updates
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'manifest:processing') {
        setCurrentStep('Processing manifest with AI...');
        setProgress(50);
      } else if (latestMessage.type === 'manifest:completed') {
        setResult(latestMessage.data);
        setProgress(100);
        setCurrentStep('Processing complete!');
        setIsProcessing(false);
      } else if (latestMessage.type === 'manifest:error') {
        toast({
          title: "Processing Error",
          description: latestMessage.data.error,
          variant: "destructive",
        });
        setIsProcessing(false);
        setProgress(0);
        setCurrentStep('');
      }
    }
  }, [messages, toast]);

  const processManifest = async () => {
    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Scanning component for manifests...');
    setResult(null);

    try {
      // Step 1: Scan component for manifests
      const scanResponse = await apiRequest('POST', '/api/manifest/scan', {
        componentCode,
        projectId: 'demo-project'
      });

      if (!scanResponse.success) {
        throw new Error(scanResponse.error || 'Failed to scan component');
      }

      setProgress(30);
      setCurrentStep('Processing manifests with unified engine...');

      // Step 2: Process manifests with unified engine
      const processResponse = await apiRequest('POST', '/api/manifest/process', {
        manifest: scanResponse.manifests || []
      });

      if (processResponse.success) {
        setResult(processResponse.data);
        setProgress(100);
        setCurrentStep('Processing complete!');
        
        toast({
          title: "Success",
          description: `Generated ${scanResponse.manifests?.length || 0} manifest items with backend, frontend, and test code`,
        });
      } else {
        throw new Error(processResponse.error || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Unified manifest processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || 'An error occurred during processing',
        variant: "destructive",
      });
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Unified AI Manifest Engine Demo
              </CardTitle>
              <CardDescription>
                Experience the consolidated AI manifest system with real-time WebSocket communication
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Component Code</label>
            <Textarea
              value={componentCode}
              onChange={(e) => setComponentCode(e.target.value)}
              placeholder="Enter React component code with data-manifest attributes..."
              className="mt-1 h-64 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={processManifest} 
              disabled={isProcessing || !componentCode.trim()}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Process with Unified Engine'}
            </Button>
          </div>

          {isProcessing && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {result && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="backend">Backend Code</TabsTrigger>
            <TabsTrigger value="frontend">Frontend Code</TabsTrigger>
            <TabsTrigger value="tests">Test Code</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.manifest.length}</div>
                    <div className="text-sm text-gray-600">Manifests Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.code?.backend ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Backend Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.code?.frontend ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Frontend Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.code?.tests ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Tests Generated</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm">
                    <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Generated Backend Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                  <code>{result.code?.backend || 'No backend code generated'}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-500" />
                  Generated Frontend Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                  <code>{result.code?.frontend || 'No frontend code generated'}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Generated Test Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
                  <code>{result.code?.tests || 'No test code generated'}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}