import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SimpleBlobPreview from '@/components/ide/SimpleBlobPreview';
import { Wand2, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function BlobDemo() {
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>Interactive Demo</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .btn {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Blob Injection Demo</h1>
    <p>This content is rendered through dynamic blob URL injection!</p>
    <button class="btn" onclick="alert('Blob injection working!')">Test Interaction</button>
  </div>
</body>
</html>`);

  const aiGenerateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/generate-code', {
        prompt,
        projectType: 'html'
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.code) {
        setHtmlContent(data.code);
      }
    }
  });

  const handleAIGenerate = (prompt: string) => {
    aiGenerateMutation.mutate(prompt);
  };

  const presetExamples = [
    {
      title: "Animated Landing",
      prompt: "Create a modern landing page with floating animations and neon buttons"
    },
    {
      title: "Dashboard Card",
      prompt: "Build a sleek analytics dashboard card with charts and metrics"
    },
    {
      title: "Game Interface",
      prompt: "Design a retro game interface with pixel art styling and interactive elements"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Blob Injection Live Demo</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time HTML rendering with dynamic blob URLs - inspired by ChatGPT's clean approach
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Code Editor Side */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                HTML Code Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="Enter your HTML code here..."
              />
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Quick Generate
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {presetExamples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGenerate(example.prompt)}
                      disabled={aiGenerateMutation.isPending}
                      className="text-left"
                    >
                      {example.title}
                    </Button>
                  ))}
                </div>
                
                {aiGenerateMutation.isPending && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    AI generating code...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Side */}
          <SimpleBlobPreview 
            htmlContent={htmlContent}
            showControls={true}
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">How Blob Injection Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <strong>1. Code Input</strong>
                <p className="mt-2">HTML content is updated in real-time as you type or generate with AI</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <strong>2. Blob Creation</strong>
                <p className="mt-2">Content is converted to a blob URL with security headers and CSP</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <strong>3. Iframe Injection</strong>
                <p className="mt-2">Sandboxed iframe loads the blob URL for secure, isolated execution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}