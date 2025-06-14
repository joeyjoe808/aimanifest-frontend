import { useQuery } from '@tanstack/react-query';
import { Lightbulb, AlertCircle, Info, Zap, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Hint {
  type: 'tip' | 'suggestion' | 'warning' | 'feature';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface SessionHints {
  hints: Hint[];
  timestamp: string;
}

export default function ConversationalHints() {
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  const { data: hintsData } = useQuery({
    queryKey: ['/api/session/hints'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getHintIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'feature':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set(Array.from(prev).concat(hintId)));
  };

  const hints = (hintsData as SessionHints)?.hints || [];
  const visibleHints = hints.filter((_: Hint, index: number) => !dismissedHints.has(`hint-${index}`));

  if (visibleHints.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        All caught up! New tips will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {visibleHints.map((hint: Hint, index: number) => (
        <div
          key={`hint-${index}`}
          className="relative bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <button
            onClick={() => dismissHint(`hint-${index}`)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start space-x-3 pr-6">
            {getHintIcon(hint.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">{hint.title}</h4>
                <Badge className={`text-xs ${getPriorityColor(hint.priority)}`}>
                  {hint.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{hint.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}