import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle, AlertCircle } from "lucide-react";

interface ProcessedInput {
  correctedInput: string;
  intent: string;
  confidence: number;
  suggestions: string[];
  contextualUnderstanding: string;
}

interface SmartInputProcessorProps {
  userInput: string;
  onProcessedInput: (processed: ProcessedInput) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function SmartInputProcessor({ 
  userInput, 
  onProcessedInput, 
  onConfirm, 
  isProcessing 
}: SmartInputProcessorProps) {
  const [processed, setProcessed] = useState<ProcessedInput | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (userInput.trim()) {
      processInput(userInput);
    }
  }, [userInput]);

  const processInput = async (input: string) => {
    try {
      const response = await fetch('/api/ai/process-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: '' })
      });
      
      if (response.ok) {
        const result = await response.json();
        setProcessed(result);
        onProcessedInput(result);
        
        // Show suggestions if confidence is low or there are typos
        if (result.confidence < 0.8 || result.correctedInput !== input) {
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Input processing failed:', error);
    }
  };

  if (!processed || isProcessing) return null;

  const hasCorrections = processed.correctedInput !== userInput;
  const isLowConfidence = processed.confidence < 0.8;

  return (
    <div className="border rounded-lg p-4 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {processed.confidence >= 0.8 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Understanding:</span>
              <Badge variant={processed.confidence >= 0.8 ? "default" : "secondary"}>
                {Math.round(processed.confidence * 100)}% confident
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {processed.contextualUnderstanding}
            </p>
          </div>

          {hasCorrections && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border">
              <p className="text-xs text-muted-foreground mb-1">Corrected input:</p>
              <p className="text-sm font-medium">{processed.correctedInput}</p>
            </div>
          )}

          {showSuggestions && processed.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">Alternative interpretations:</span>
              </div>
              <div className="space-y-1">
                {processed.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-left text-xs p-2 rounded bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                    onClick={() => {
                      setProcessed({ ...processed, intent: suggestion });
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button 
              onClick={onConfirm}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Looks good, proceed
            </Button>
            
            {(hasCorrections || isLowConfidence) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? 'Hide' : 'Show'} options
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}