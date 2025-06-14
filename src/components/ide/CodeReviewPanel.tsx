import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, XCircle, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CodeIssue {
  line: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'performance' | 'security' | 'style' | 'maintainability';
  message: string;
  suggestion: string;
}

interface CodeReviewResult {
  score: number;
  issues: CodeIssue[];
  recommendations: string[];
  refactoredCode?: string;
}

interface CodeReviewPanelProps {
  projectId: number;
  currentCode: string;
  language: string;
}

export default function CodeReviewPanel({ projectId, currentCode, language }: CodeReviewPanelProps) {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);

  const reviewCodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          code: currentCode,
          language
        })
      });
    },
    onSuccess: (result) => {
      setReviewResult(result);
    }
  });

  const handleReviewCode = () => {
    if (currentCode.trim()) {
      reviewCodeMutation.mutate();
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Code Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleReviewCode}
          disabled={reviewCodeMutation.isPending || !currentCode.trim()}
          className="w-full"
          size="sm"
        >
          {reviewCodeMutation.isPending ? 'Analyzing...' : 'Review Code'}
        </Button>

        {reviewResult && (
          <div className="space-y-4">
            {/* Score Display */}
            <div className="text-center space-y-2">
              <div className={`text-2xl font-bold ${getScoreColor(reviewResult.score)}`}>
                {reviewResult.score}/100
              </div>
              <Progress value={reviewResult.score} className="h-2" />
              <p className="text-xs text-muted-foreground">Overall Code Quality</p>
            </div>

            {/* Issues Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold">{reviewResult.issues.length}</div>
                <div className="text-xs text-muted-foreground">Issues Found</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold">{reviewResult.recommendations.length}</div>
                <div className="text-xs text-muted-foreground">Suggestions</div>
              </div>
            </div>

            {/* Issues List */}
            {reviewResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Issues ({reviewResult.issues.length})
                </h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-4">
                    {reviewResult.issues.map((issue, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {issue.type}
                              </Badge>
                              {issue.line && (
                                <span className="text-xs text-muted-foreground">
                                  Line {issue.line}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium">{issue.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {issue.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Recommendations */}
            {reviewResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recommendations
                </h4>
                <div className="space-y-1">
                  {reviewResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refactored Code Option */}
            {reviewResult.refactoredCode && (
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Apply Suggested Improvements
                </Button>
              </div>
            )}
          </div>
        )}

        {reviewCodeMutation.error && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
            Code review failed. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}