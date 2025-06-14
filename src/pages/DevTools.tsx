import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ButtonManifestUI from '@/components/dev-tools/ButtonManifestUI';

export default function DevTools() {
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRouteCode = async (manifest: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/dev-tools/generate-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manifest }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate routes');
      }

      const code = await response.json();
      setGeneratedCode(code);
    } catch (error) {
      console.error('Route generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Dev Tools
          </h1>
          <p className="text-lg text-gray-600">
            Automated development tools for button discovery, manifest generation, and code generation
          </p>
        </div>

        <Tabs defaultValue="manifest" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manifest">Button Manifest</TabsTrigger>
            <TabsTrigger value="codegen">Code Generation</TabsTrigger>
            <TabsTrigger value="workflow">Workflow Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="manifest" className="mt-6">
            <ButtonManifestUI />
          </TabsContent>

          <TabsContent value="codegen" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automatic Code Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate route handlers, actions, loading states, and WebSocket handlers from button manifests
                  </p>
                  
                  {!generatedCode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        First generate a button manifest in the Button Manifest tab, then return here to generate code
                      </p>
                    </div>
                  )}

                  {generatedCode && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Route Handlers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              {generatedCode.generatedRoutes}
                            </pre>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Frontend Actions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              {generatedCode.generatedActions}
                            </pre>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">WebSocket Handlers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="bg-gray-900 text-purple-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                              {generatedCode.generatedWebSocketHandlers}
                            </pre>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Loading State Hooks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-900 text-orange-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                            {generatedCode.generatedLoadingStates || generatedCode.loadingStates}
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Master AI Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Automated Workflow</h3>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Button Discovery: Automatically scan React components for buttons</li>
                      <li>• AI Enhancement: Enrich button metadata with Claude AI</li>
                      <li>• Code Generation: Generate route handlers and frontend actions</li>
                      <li>• Integration: Auto-link buttons to backend functionality</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Smart Features</h3>
                    <ul className="space-y-2 text-green-700">
                      <li>• WebSocket detection for real-time operations</li>
                      <li>• Input validation generation</li>
                      <li>• Loading state management</li>
                      <li>• Error handling patterns</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Enterprise Ready</h3>
                    <ul className="space-y-2 text-purple-700">
                      <li>• Comprehensive manifest generation</li>
                      <li>• Type-safe code generation</li>
                      <li>• Scalable architecture patterns</li>
                      <li>• Development workflow optimization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">15+</div>
                      <div className="text-sm opacity-90">Button Types</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-sm opacity-90">Categories</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm opacity-90">AI Enhanced</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">Auto</div>
                      <div className="text-sm opacity-90">Generated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}