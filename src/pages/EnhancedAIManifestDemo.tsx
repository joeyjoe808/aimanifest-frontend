import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Code2, Cpu, Zap, Settings, Play, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'

interface ButtonManifest {
  actionId: string
  label: string
  function: string
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  category?: string
}

export default function EnhancedAIManifestDemo() {
  const [manifest, setManifest] = useState<ButtonManifest[]>([
    {
      actionId: 'create-user',
      label: 'Create New User',
      function: 'createUser',
      httpMethod: 'POST',
      description: 'Register a new user account with validation',
      category: 'User Management'
    },
    {
      actionId: 'send-notification',
      label: 'Send Alert',
      function: 'sendNotification',
      httpMethod: 'POST',
      description: 'Send real-time notification to users',
      category: 'Communication'
    },
    {
      actionId: 'export-data',
      label: 'Export Report',
      function: 'exportReport',
      httpMethod: 'GET',
      description: 'Generate and download data report',
      category: 'Analytics'
    }
  ])

  const [generatedCode, setGeneratedCode] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('manifest')
  const [streamProgress, setStreamProgress] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const { toast } = useToast()

  // Tool-based code generation
  const toolsMutation = useMutation({
    mutationFn: async (manifest: ButtonManifest[]) => {
      return await apiRequest('POST', '/api/ai-manifest-engine/generate-with-tools', { manifest })
    },
    onSuccess: (response) => {
      setGeneratedCode(response)
      setActiveTab('results')
      toast({
        title: "Code Generated Successfully",
        description: "AI tools have generated production-ready code from your manifest."
      })
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      })
    }
  })

  // Streaming code generation
  const streamingMutation = useMutation({
    mutationFn: async (manifest: ButtonManifest[]) => {
      setIsStreaming(true)
      setStreamProgress(0)

      const eventSource = new EventSource('/api/ai-manifest-engine/generate-stream', {
        headers: { 'Content-Type': 'application/json' }
      })

      return new Promise((resolve, reject) => {
        eventSource.addEventListener('progress', (event) => {
          const data = JSON.parse(event.data)
          setStreamProgress(prev => Math.min(prev + 10, 90))
        })

        eventSource.addEventListener('complete', (event) => {
          const data = JSON.parse(event.data)
          setStreamProgress(100)
          setIsStreaming(false)
          eventSource.close()
          resolve(data)
        })

        eventSource.addEventListener('error', (event) => {
          const data = JSON.parse(event.data)
          setIsStreaming(false)
          eventSource.close()
          reject(new Error(data.error))
        })

        // Send the manifest data
        fetch('/api/ai-manifest-engine/generate-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manifest })
        })
      })
    },
    onSuccess: (response) => {
      setGeneratedCode(response)
      setActiveTab('results')
      toast({
        title: "Streaming Complete",
        description: "Real-time code generation completed successfully."
      })
    },
    onError: (error) => {
      setIsStreaming(false)
      toast({
        title: "Streaming Failed",
        description: error instanceof Error ? error.message : "Stream generation failed",
        variant: "destructive"
      })
    }
  })

  const addManifestItem = () => {
    setManifest([...manifest, {
      actionId: `action-${Date.now()}`,
      label: 'New Action',
      function: 'newFunction',
      httpMethod: 'POST',
      description: 'New action description'
    }])
  }

  const updateManifestItem = (index: number, field: keyof ButtonManifest, value: string) => {
    const updated = [...manifest]
    updated[index] = { ...updated[index], [field]: value }
    setManifest(updated)
  }

  const removeManifestItem = (index: number) => {
    setManifest(manifest.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enhanced AI Manifest Engine
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced Claude-powered code generation with tool-use capabilities, streaming responses, and real-time collaboration
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Claude Sonnet 4.0
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Code2 className="h-3 w-3 mr-1" />
              Tool-Based Generation
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Settings className="h-3 w-3 mr-1" />
              Streaming Support
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manifest">Button Manifest</TabsTrigger>
            <TabsTrigger value="generation">AI Generation</TabsTrigger>
            <TabsTrigger value="results">Generated Code</TabsTrigger>
          </TabsList>

          <TabsContent value="manifest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configure Button Manifest</span>
                </CardTitle>
                <CardDescription>
                  Define your application's button actions and functions. The AI will generate complete backend routes and frontend components.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {manifest.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">Action ID</label>
                        <input
                          className="w-full p-2 border rounded-md mt-1"
                          value={item.actionId}
                          onChange={(e) => updateManifestItem(index, 'actionId', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Label</label>
                        <input
                          className="w-full p-2 border rounded-md mt-1"
                          value={item.label}
                          onChange={(e) => updateManifestItem(index, 'label', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Function Name</label>
                        <input
                          className="w-full p-2 border rounded-md mt-1"
                          value={item.function}
                          onChange={(e) => updateManifestItem(index, 'function', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">HTTP Method</label>
                        <select
                          className="w-full p-2 border rounded-md mt-1"
                          value={item.httpMethod}
                          onChange={(e) => updateManifestItem(index, 'httpMethod', e.target.value as any)}
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                          <option value="PATCH">PATCH</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        className="mt-1"
                        value={item.description}
                        onChange={(e) => updateManifestItem(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeManifestItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
                
                <Button onClick={addManifestItem} className="w-full">
                  Add New Action
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Tool-Based Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Uses Claude's advanced tool-use capabilities for structured code generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => toolsMutation.mutate(manifest)}
                    disabled={toolsMutation.isPending || manifest.length === 0}
                    className="w-full"
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    {toolsMutation.isPending ? 'Generating...' : 'Generate with Tools'}
                  </Button>
                  {toolsMutation.isPending && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        AI is analyzing your manifest and generating structured code...
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Streaming Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time code generation with live progress updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => streamingMutation.mutate(manifest)}
                    disabled={streamingMutation.isPending || isStreaming || manifest.length === 0}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isStreaming ? 'Streaming...' : 'Generate with Streaming'}
                  </Button>
                  {isStreaming && (
                    <div className="mt-4 space-y-2">
                      <Progress value={streamProgress} className="w-full" />
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Streaming code generation in progress... {streamProgress}%
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Manifest Summary</CardTitle>
                <CardDescription>
                  {manifest.length} actions configured for code generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {manifest.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={item.httpMethod === 'GET' ? 'secondary' : 'default'}>
                          {item.httpMethod}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{item.actionId}</span>
                      </div>
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.function}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {generatedCode ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Code2 className="h-5 w-5" />
                        <span>Generated Code Results</span>
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      AI-generated TypeScript code based on your button manifest
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
                      <pre className="text-green-400 text-sm">
                        <code>{JSON.stringify(generatedCode, null, 2)}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Backend Routes</CardTitle>
                      <CardDescription>Express.js TypeScript routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">TypeScript + Express</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Production-ready backend routes with validation and error handling
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Frontend Components</CardTitle>
                      <CardDescription>React TypeScript components</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">React + TypeScript</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Responsive UI components with state management and API integration
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Code Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Configure your manifest and run AI generation to see results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}