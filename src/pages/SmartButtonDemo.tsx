import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Code, Zap, Database, Play, Copy, CheckCircle } from 'lucide-react';
import { SmartButton, LiveStreamButton, SubmitFormButton, ExportDataButton } from '@/components/SmartButton';
import { useToast } from '@/hooks/use-toast';

export default function SmartButtonDemo() {
  const { toast } = useToast();
  const [demoResults, setDemoResults] = useState<string[]>([]);

  // Sample manifest that was used to generate the SmartButton component
  const sampleManifest = {
    id: "startLiveStream",
    label: "Go Live",
    action: "startLiveStream",
    realtime: true,
    socketEvent: "live:start",
    errorHandling: true,
    loadingStates: true,
    description: "Start live streaming with real-time feedback"
  };

  const claudePrompt = `You're a senior frontend engineer. Generate a reusable SmartButton React component in TypeScript + Tailwind CSS based on the following manifest. Include real-time feedback (loading, success, error) and hook it to a backend API or WebSocket depending on \`realtime: true\`.

**Manifest:**
{
  "id": "startLiveStream",
  "label": "Go Live",
  "action": "startLiveStream",
  "realtime": true,
  "socketEvent": "live:start"
}

**Requirements:**
- Use React + TypeScript
- Include loading state, error handling, and success confirmation
- If \`realtime: true\`, connect to a WebSocket using a custom hook (e.g., \`useSocket\`)
- Otherwise, use \`fetch\` or \`axios\`
- Ensure accessibility (aria-*, keyboard focus)

**Component Structure:**
1. Import necessary dependencies
2. Create custom \`useSocket\` hook for WebSocket management
3. Main SmartButton component with comprehensive state management
4. Export specific button implementations

**Generated Implementation:**
The SmartButton component includes:
- Real-time WebSocket connectivity with connection status indicators
- Comprehensive loading states and progress tracking
- Auto-retry logic with exponential backoff
- Confirmation dialogs for destructive actions
- Full accessibility support
- Debouncing for rapid clicks
- Visual feedback with animations and status badges`;

  const addDemoResult = (result: string) => {
    setDemoResults(prev => [...prev, result]);
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description,
    });
  };

  const handleCustomAction = () => {
    addDemoResult(`Custom action executed at ${new Date().toLocaleTimeString()}`);
    toast({
      title: "Custom Action",
      description: "Successfully demonstrated custom onClick handler",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time SmartButton Components</h1>
        <p className="text-muted-foreground">
          Demonstration of AI-generated SmartButton components with real-time WebSocket integration
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="manifest">Manifest</TabsTrigger>
          <TabsTrigger value="prompt">Claude Prompt</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Real-Time SmartButtons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Live Stream Button (Real-time WebSocket)</h4>
                    <LiveStreamButton />
                    <p className="text-sm text-muted-foreground mt-1">
                      Uses WebSocket connection with confirmation dialog
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Form Submit Button (REST API)</h4>
                    <SubmitFormButton />
                    <p className="text-sm text-muted-foreground mt-1">
                      REST API call with auto-retry functionality
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Export Data Button (REST API)</h4>
                    <ExportDataButton />
                    <p className="text-sm text-muted-foreground mt-1">
                      File export with progress tracking
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Custom Action Button</h4>
                    <SmartButton
                      id="customAction"
                      label="Custom Action"
                      onClick={handleCustomAction}
                      variant="secondary"
                      loadingText="Processing..."
                      successText="Success!"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Custom onClick handler with state management
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Demo Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {demoResults.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Click the buttons above to see results
                    </p>
                  ) : (
                    demoResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span>{result}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Component Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Real-Time Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• WebSocket connectivity</li>
                    <li>• Connection status indicators</li>
                    <li>• Real-time progress updates</li>
                    <li>• Live event broadcasting</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">State Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Loading, success, error states</li>
                    <li>• Progress tracking</li>
                    <li>• Auto-retry with backoff</li>
                    <li>• Confirmation dialogs</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">User Experience</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Debouncing for rapid clicks</li>
                    <li>• Accessibility support</li>
                    <li>• Visual feedback</li>
                    <li>• Custom styling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manifest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Button Manifest Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The button manifest defines the configuration for generating SmartButton components:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    {JSON.stringify(sampleManifest, null, 2)}
                  </pre>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(sampleManifest, null, 2), 'Manifest copied')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Manifest
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manifest Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Required Properties</h4>
                    <ul className="space-y-1 text-sm">
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">id</code> - Unique identifier</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">label</code> - Button text</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">action</code> - Action identifier</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Optional Properties</h4>
                    <ul className="space-y-1 text-sm">
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">realtime</code> - Enable WebSocket</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">socketEvent</code> - WebSocket event name</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">endpoint</code> - REST API endpoint</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">method</code> - HTTP method</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Claude Prompt Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This is the structured prompt template used to generate the SmartButton component:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
                  <pre className="text-sm whitespace-pre-wrap">
                    {claudePrompt}
                  </pre>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(claudePrompt, 'Claude prompt copied')}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Prompt
                  </Button>
                  <Badge variant="secondary">
                    ~{Math.ceil(claudePrompt.length / 4)} tokens
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Generated Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The SmartButton component was generated using the Claude prompt template and includes:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Core Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ TypeScript interfaces and type safety</li>
                      <li>✓ Custom useSocket hook for WebSocket management</li>
                      <li>✓ TanStack Query integration for REST APIs</li>
                      <li>✓ Comprehensive state management</li>
                      <li>✓ Error handling with retry logic</li>
                      <li>✓ Progress tracking and visual feedback</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Advanced Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ Debouncing for rapid clicks</li>
                      <li>✓ Confirmation dialogs</li>
                      <li>✓ Accessibility support (ARIA, screen readers)</li>
                      <li>✓ Connection status indicators</li>
                      <li>✓ Customizable styling with Tailwind CSS</li>
                      <li>✓ Export functions for common use cases</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Generated Files</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">client/src/components/SmartButton.tsx</Badge>
                      <span className="text-sm text-muted-foreground">Main component implementation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Exports</Badge>
                      <span className="text-sm text-muted-foreground">LiveStreamButton, SubmitFormButton, ExportDataButton</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Integration Points</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• WebSocket server at <code>/ws</code> endpoint</p>
                    <p>• REST API endpoints as defined in manifests</p>
                    <p>• Real-time event broadcasting system</p>
                    <p>• Toast notifications for user feedback</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}