import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, Zap } from 'lucide-react';

interface IntentData {
  intent: string;
  confidence: number;
  suggestions: string[];
  timestamp: string;
}

interface SmartInputProcessorProps {
  userInput: string;
  onProcessedInput: (data: IntentData) => void;
  onConfirm?: (data: IntentData) => void;
  isProcessing?: boolean;
}

export function SmartInputProcessor({ 
  userInput, 
  onProcessedInput, 
  onConfirm, 
  isProcessing = false 
}: SmartInputProcessorProps) {
  const [processed, setProcessed] = useState<IntentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInput.trim()) {
      processInput(userInput);
    }
  }, [userInput]);

  const processInput = async (input: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProcessed(data);
      onProcessedInput(data);
    } catch (error) {
      console.error('Intent analysis failed:', error);
      const fallbackData: IntentData = {
        intent: 'general',
        confidence: 0.5,
        suggestions: ['Try being more specific about your requirements'],
        timestamp: new Date().toISOString()
      };
      setProcessed(fallbackData);
      onProcessedInput(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'creation': return 'bg-green-100 text-green-800';
      case 'debugging': return 'bg-red-100 text-red-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'deployment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'creation': return <Zap className="w-4 h-4" />;
      case 'debugging': return <Target className="w-4 h-4" />;
      case 'design': return <Brain className="w-4 h-4" />;
      case 'deployment': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (!userInput.trim()) return null;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Brain className="w-4 h-4 animate-pulse" />
            Analyzing intent...
          </div>
        ) : processed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`flex items-center gap-1 ${getIntentColor(processed.intent)}`}>
                {getIntentIcon(processed.intent)}
                {processed.intent.charAt(0).toUpperCase() + processed.intent.slice(1)}
              </Badge>
              <span className="text-sm text-gray-600">
                {Math.round(processed.confidence * 100)}% confidence
              </span>
            </div>

            {processed.suggestions.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {processed.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {onConfirm && (
              <button
                onClick={() => onConfirm(processed)}
                disabled={isProcessing}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Process'}
              </button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}