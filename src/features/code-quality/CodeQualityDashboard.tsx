import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  FileText, 
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Bug,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CodeQualityMetrics {
  overallScore: number;
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  codeSmells: CodeSmell[];
  duplicatedLines: number;
  testCoverage: number;
  technicalDebt: TechnicalDebtItem[];
  refactoringOpportunities: RefactoringOpportunity[];
}

interface CodeSmell {
  type: 'long_method' | 'large_class' | 'duplicated_code' | 'complex_conditional' | 'dead_code';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { file: string; line: number; column: number; };
  description: string;
  suggestion: string;
  estimatedEffort: number;
}

interface TechnicalDebtItem {
  id: string;
  type: 'architecture' | 'design' | 'documentation' | 'testing' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  estimatedEffort: number;
  businessValue: number;
}

interface RefactoringOpportunity {
  type: string;
  confidence: number;
  location: { file: string; startLine: number; endLine: number; };
  description: string;
  benefits: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  automatable: boolean;
}

export default function CodeQualityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject] = useState(1);
  const queryClient = useQueryClient();

  // Fetch code quality metrics
  const { data: qualityData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/code-quality/metrics', selectedProject],
    refetchInterval: 30000
  });

  // Analyze code quality mutation
  const analyzeCodeMutation = useMutation({
    mutationFn: (request: any) => apiRequest('/api/code-quality/analyze', 'POST', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/code-quality/metrics'] });
    }
  });

  // Generate refactoring plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: (data: { projectId: number; opportunities: RefactoringOpportunity[] }) => 
      apiRequest('/api/code-quality/refactor-plan', 'POST', data)
  });

  const handleAnalyzeCode = () => {
    analyzeCodeMutation.mutate({
      projectId: selectedProject,
      analysisType: 'full',
      includeTests: true,
      includeDocumentation: true
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Use real data from API when available
  const metrics = qualityData?.trends || {
    overallScore: 87,
    maintainabilityIndex: 78,
    cyclomaticComplexity: 12,
    duplicatedLines: 45,
    testCoverage: 82,
    codeSmells: [],
    technicalDebt: [],
    refactoringOpportunities: []
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Code Quality Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered code analysis and improvement recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleAnalyzeCode}
            disabled={analyzeCodeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzeCodeMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Code className="w-4 h-4 mr-2" />
            )}
            Analyze Code
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={metrics.overallScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Test Coverage</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.testCoverage)}`}>
                  {metrics.testCoverage}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={metrics.testCoverage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Code Smells</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics.codeSmells?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-600 dark:text-orange-400">
                  Active issues detected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tech Debt</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics.technicalDebt?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Track improvement areas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="code-smells">Code Smells</TabsTrigger>
          <TabsTrigger value="tech-debt">Technical Debt</TabsTrigger>
          <TabsTrigger value="refactoring">Refactoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Score</span>
                    <div className="flex items-center">
                      {getTrendIcon('improving')}
                      <span className="ml-2 font-semibold">{metrics.overallScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maintainability</span>
                    <div className="flex items-center">
                      {getTrendIcon('stable')}
                      <span className="ml-2 font-semibold">{metrics.maintainabilityIndex}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Complexity</span>
                    <div className="flex items-center">
                      {getTrendIcon('declining')}
                      <span className="ml-2 font-semibold">{metrics.cyclomaticComplexity}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => generatePlanMutation.mutate({ 
                      projectId: selectedProject, 
                      opportunities: metrics.refactoringOpportunities || [] 
                    })}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Refactoring Plan
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Auto-Generate Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate Test Cases
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Quality Gates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="code-smells" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detected Code Smells</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Analyzing code quality...</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Run code analysis to detect issues and get improvement suggestions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech-debt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Debt Register</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Analyzing technical debt...</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Technical debt tracking will appear here after analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refactoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refactoring Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Identifying refactoring opportunities...</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Refactoring suggestions will appear here after analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}