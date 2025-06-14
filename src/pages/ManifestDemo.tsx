import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeFromManifest } from '@/components/generated/HomeFromManifest';

const sampleManifest = [
  {
    label: 'Search Items',
    function: 'searchItems',
    backendRoute: '/api/searchItems',
    component: 'TestButtons',
    httpMethod: 'POST' as const,
    category: 'Search Operations',
    description: 'Search through available items',
    communicationType: 'REST' as const
  },
  {
    label: 'Create New',
    function: 'createNew',
    backendRoute: '/api/createNew',
    component: 'TestButtons',
    httpMethod: 'POST' as const,
    category: 'CRUD Operations',
    description: 'Create a new item',
    communicationType: 'REST' as const
  },
  {
    label: 'Save Changes',
    function: 'saveChanges',
    backendRoute: '/api/saveChanges',
    component: 'TestButtons',
    httpMethod: 'POST' as const,
    category: 'CRUD Operations',
    description: 'Save current changes',
    communicationType: 'REST' as const
  },
  {
    label: 'Edit Selected',
    function: 'editSelected',
    backendRoute: '/api/editSelected',
    component: 'TestButtons',
    httpMethod: 'PUT' as const,
    category: 'CRUD Operations',
    description: 'Edit the selected item',
    communicationType: 'REST' as const
  },
  {
    label: 'Delete Items',
    function: 'deleteItems',
    backendRoute: '/api/deleteItems',
    component: 'TestButtons',
    httpMethod: 'DELETE' as const,
    category: 'CRUD Operations',
    description: 'Delete selected items',
    communicationType: 'REST' as const
  },
  {
    label: 'Import Data',
    function: 'importData',
    backendRoute: '/api/importData',
    component: 'TestButtons',
    httpMethod: 'POST' as const,
    category: 'File Operations',
    description: 'Import data from file',
    communicationType: 'REST' as const
  },
  {
    label: 'Export Data',
    function: 'exportData',
    backendRoute: '/api/exportData',
    component: 'TestButtons',
    httpMethod: 'GET' as const,
    category: 'File Operations',
    description: 'Export data to file',
    communicationType: 'REST' as const
  },
  {
    label: 'Share Report',
    function: 'shareReport',
    backendRoute: '/api/shareReport',
    component: 'TestButtons',
    httpMethod: 'POST' as const,
    category: 'File Operations',
    description: 'Share generated report',
    communicationType: 'REST' as const
  }
];

export default function ManifestDemo() {
  const [showManifest, setShowManifest] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              SmartButton Manifest Integration Demo
            </CardTitle>
            <p className="text-muted-foreground">
              Complete workflow from button scanning to auto-generated interface with backend integration
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={() => setShowManifest(!showManifest)}
                variant={showManifest ? "secondary" : "default"}
              >
                {showManifest ? "Hide Generated Interface" : "Show Generated Interface"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Component Scanning</div>
                      <div className="text-sm text-muted-foreground">Automatically extract buttons from React components</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">AI Enhancement</div>
                      <div className="text-sm text-muted-foreground">Claude analyzes and categorizes button functions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Code Generation</div>
                      <div className="text-sm text-muted-foreground">Generate backend routes and frontend actions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <div className="font-medium">SmartButton Integration</div>
                      <div className="text-sm text-muted-foreground">Automatic connection to backend with error handling</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Manifest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Total Buttons:</strong> {sampleManifest.length}</div>
                      <div><strong>Categories:</strong> 3</div>
                      <div><strong>Backend Routes:</strong> 8</div>
                      <div><strong>HTTP Methods:</strong> GET, POST, PUT, DELETE</div>
                    </div>
                    <div className="mt-4">
                      <div className="font-medium mb-2">Categories:</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Search Operations</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">CRUD Operations</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">File Operations</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {showManifest && (
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generated SmartButton Interface</CardTitle>
              <p className="text-sm text-muted-foreground">
                This interface was generated automatically from the button manifest
              </p>
            </CardHeader>
            <CardContent>
              <HomeFromManifest manifest={sampleManifest} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">SmartButton Component</div>
                <div className="text-sm text-muted-foreground">
                  Handles loading states, error messages, and API calls automatically
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">Manifest Application</div>
                <div className="text-sm text-muted-foreground">
                  Converts metadata to fully functional UI components
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-2">Backend Integration</div>
                <div className="text-sm text-muted-foreground">
                  Automatic route generation with security and validation
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}