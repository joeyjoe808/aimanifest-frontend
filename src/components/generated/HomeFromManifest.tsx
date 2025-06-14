import React from 'react';
import { SmartButton } from '@/components/SmartButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ButtonMeta {
  label: string;
  function: string;
  backendRoute?: string;
  component: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  category?: string;
  requiredInputData?: Record<string, string>;
  communicationType?: 'WebSocket' | 'REST';
}

interface HomeFromManifestProps {
  manifest: ButtonMeta[];
}

// API calling utility that handles different HTTP methods
async function callApi(route: string, inputs: string[]): Promise<any> {
  const method = route.includes('delete') ? 'DELETE' : 
                 route.includes('update') || route.includes('edit') ? 'PUT' : 
                 route.includes('get') || route.includes('fetch') ? 'GET' : 'POST';
  
  const payload = inputs.length > 0 ? 
    inputs.reduce((acc, input, index) => ({ ...acc, [`param${index + 1}`]: `[${input}_value]` }), {}) : {};

  const response = await fetch(route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
    },
    body: method !== 'GET' ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Creates a SmartButton from manifest metadata
function createButtonFromManifest(meta: ButtonMeta) {
  const determineVariant = (label: string): 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' => {
    const lower = label.toLowerCase();
    if (lower.includes('delete') || lower.includes('remove')) return 'destructive';
    if (lower.includes('cancel') || lower.includes('close')) return 'outline';
    if (lower.includes('save') || lower.includes('create')) return 'default';
    if (lower.includes('edit') || lower.includes('update')) return 'secondary';
    return 'default';
  };

  return {
    actionId: meta.function,
    label: meta.label,
    loadingText: `${meta.label}...`,
    showToastOnError: true,
    usesWebSocket: meta.communicationType === 'WebSocket',
    variant: determineVariant(meta.label),
    size: 'default' as const,
    onClick: () => callApi(meta.backendRoute || '/api/default', 
                          meta.requiredInputData ? Object.keys(meta.requiredInputData) : [])
  };
}

export function HomeFromManifest({ manifest }: HomeFromManifestProps) {
  const renderSmartButton = (buttonMeta: ButtonMeta, index: number) => {
    const props = createButtonFromManifest(buttonMeta);
    
    return (
      <SmartButton
        key={`${buttonMeta.function}-${index}`}
        actionId={props.actionId}
        label={props.label}
        loadingText={props.loadingText}
        showToastOnError={props.showToastOnError}
        usesWebSocket={props.usesWebSocket}
        variant={props.variant}
        size={props.size}
        onClick={props.onClick}
        className="min-w-[120px]"
      />
    );
  };

  const groupedButtons = manifest.reduce((groups, button) => {
    const category = button.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(button);
    return groups;
  }, {} as Record<string, ButtonMeta[]>);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Auto-Generated Interface from Button Manifest
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {manifest.length} buttons automatically connected to backend functions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedButtons).map(([category, buttons]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {buttons.map((button, index) => renderSmartButton(button, index))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Backend Routes</div>
              <div className="text-green-600">
                {manifest.filter(b => b.backendRoute).length} API endpoints
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Error Handling</div>
              <div className="text-blue-600">
                Automatic toast notifications
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-800">Loading States</div>
              <div className="text-purple-600">
                Smart button disabling
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeFromManifest;