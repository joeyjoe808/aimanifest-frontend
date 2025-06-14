import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  Search,
  Calendar,
  BarChart3,
  Activity,
  Lock,
  Scale
} from 'lucide-react';

interface ComplianceStandard {
  id: string;
  name: string;
  framework: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  score: number;
  lastAssessment: string;
  nextAssessment: string;
  controls: Array<{
    id: string;
    name: string;
    status: string;
    riskLevel: string;
  }>;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'warning';
  riskScore: number;
  complianceFlags: string[];
}

interface RiskAssessment {
  id: string;
  title: string;
  category: string;
  riskScore: number;
  status: string;
  owner: string;
  dueDate: string;
}

interface PolicyDefinition {
  id: string;
  name: string;
  category: string;
  severity: string;
  status: string;
  violations: number;
  exemptions: number;
}

export default function GovernanceDashboard() {
  const [auditFilters, setAuditFilters] = useState({
    outcome: '',
    startDate: '',
    endDate: ''
  });

  // Fetch governance dashboard data
  const { data: dashboardData } = useQuery<{
    dashboard: any;
    alerts: Array<{
      type: string;
      message: string;
      priority: string;
      dueDate: string;
    }>;
  }>({
    queryKey: ['governance-dashboard'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 300000,
  });

  // Fetch compliance standards
  const { data: complianceData } = useQuery<{
    overview: {
      summary: any;
      standards: ComplianceStandard[];
      upcomingAssessments: any[];
      recentActivity: any[];
    };
  }>({
    queryKey: ['governance-compliance'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/compliance');
      if (!response.ok) throw new Error('Failed to fetch compliance data');
      return response.json();
    }
  });

  // Fetch audit trail
  const { data: auditData } = useQuery<{
    events: AuditEvent[];
    summary: any;
    pagination: any;
  }>({
    queryKey: ['governance-audit-trail', auditFilters],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/audit-trail');
      if (!response.ok) throw new Error('Failed to fetch audit data');
      return response.json();
    }
  });

  // Fetch risk assessments
  const { data: riskData } = useQuery<{
    assessments: RiskAssessment[];
    summary: any;
  }>({
    queryKey: ['governance-risk-assessments'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/risk-assessments');
      if (!response.ok) throw new Error('Failed to fetch risk data');
      return response.json();
    }
  });

  // Fetch policies
  const { data: policiesData } = useQuery<{
    policies: PolicyDefinition[];
    summary: any;
  }>({
    queryKey: ['governance-policies'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/policies');
      if (!response.ok) throw new Error('Failed to fetch policies data');
      return response.json();
    }
  });

  // Fetch AI ethics data
  const { data: ethicsData } = useQuery<{
    reports: any[];
    summary: any;
    ethicsGuidelines: any;
  }>({
    queryKey: ['governance-ai-ethics'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/governance/ai-ethics');
      if (!response.ok) throw new Error('Failed to fetch ethics data');
      return response.json();
    }
  });

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'non_compliant': return 'bg-red-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 20) return 'bg-red-500';
    if (score >= 15) return 'bg-orange-500';
    if (score >= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Governance & Compliance</h1>
          <p className="text-muted-foreground">
            Enterprise governance, risk management, and compliance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500">
            {dashboardData?.dashboard?.compliance?.overallScore || 92}% Compliant
          </Badge>
          <Badge variant="outline">
            {dashboardData?.dashboard?.risk?.totalRisks || 12} Active Risks
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              <span>Critical Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-3">
                  <AlertCircle className={`h-4 w-4 ${alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <span className="font-medium">{alert.message}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                    {alert.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Due: {alert.dueDate}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="ai-ethics">AI Ethics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData?.dashboard?.compliance?.overallScore || 92}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.dashboard?.compliance?.frameworksCompliant || 2} frameworks compliant
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData?.dashboard?.risk?.openRisks || 8}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.dashboard?.risk?.highRisks || 3} high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData?.dashboard?.policies?.recentViolations || 3}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Fairness</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData?.dashboard?.aiEthics?.averageFairness || 78}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.dashboard?.aiEthics?.modelsAssessed || 1} models assessed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Regulatory framework compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceData?.overview?.standards?.slice(0, 3).map((standard) => (
                  <div key={standard.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getComplianceStatusColor(standard.status)}`} />
                      <div>
                        <p className="font-medium">{standard.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {standard.score}%</p>
                      </div>
                    </div>
                    <Badge className={getComplianceStatusColor(standard.status)}>
                      {standard.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Summary</CardTitle>
                <CardDescription>Current risk landscape overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskData?.assessments?.slice(0, 3).map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(risk.riskScore)}`} />
                      <div>
                        <p className="font-medium text-sm">{risk.title}</p>
                        <p className="text-xs text-muted-foreground">Score: {risk.riskScore}/25</p>
                      </div>
                    </div>
                    <Badge variant="outline">{risk.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="space-y-6">
            {complianceData?.overview?.standards?.map((standard) => (
              <Card key={standard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>{standard.name}</span>
                      </CardTitle>
                      <CardDescription>Framework: {standard.framework}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getComplianceStatusColor(standard.status)}>
                        {standard.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{standard.score}%</p>
                        <p className="text-sm text-muted-foreground">Compliance Score</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Assessment</p>
                      <p className="font-medium">{new Date(standard.lastAssessment).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Assessment</p>
                      <p className="font-medium">{new Date(standard.nextAssessment).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Controls</p>
                      <p className="font-medium">{standard.controls.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Implemented</p>
                      <p className="font-medium">
                        {standard.controls.filter(c => c.status === 'implemented').length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Controls</h4>
                    <div className="space-y-2">
                      {standard.controls.slice(0, 3).map((control) => (
                        <div key={control.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{control.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {control.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={control.status === 'implemented' ? 'default' : 'secondary'}>
                              {control.status}
                            </Badge>
                            <Badge className={
                              control.riskLevel === 'high' ? 'bg-red-500' :
                              control.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }>
                              {control.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select 
                  value={auditFilters.outcome} 
                  onValueChange={(value) => setAuditFilters(prev => ({ ...prev, outcome: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Outcomes</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={auditFilters.startDate}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
                
                <Input
                  type="date"
                  placeholder="End Date"
                  value={auditFilters.endDate}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
                
                <Button 
                  variant="outline"
                  onClick={() => setAuditFilters({ outcome: '', startDate: '', endDate: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{auditData?.summary?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{auditData?.summary?.highRiskEvents || 0}</div>
                <p className="text-sm text-muted-foreground">High Risk Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{auditData?.summary?.complianceFlags || 0}</div>
                <p className="text-sm text-muted-foreground">Compliance Flags</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {auditData?.summary?.byOutcome?.success || 0}
                </div>
                <p className="text-sm text-muted-foreground">Successful Events</p>
              </CardContent>
            </Card>
          </div>

          {/* Audit Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditData?.events?.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.outcome === 'success' ? 'bg-green-500' :
                        event.outcome === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.userId} • {event.resource}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.outcome === 'success' ? 'default' : 'destructive'}>
                        {event.outcome}
                      </Badge>
                      <Badge variant="outline">Risk: {event.riskScore}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          {/* Risk Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {riskData?.summary?.byRiskLevel?.critical || 0}
                </div>
                <p className="text-sm text-muted-foreground">Critical Risks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {riskData?.summary?.byRiskLevel?.high || 0}
                </div>
                <p className="text-sm text-muted-foreground">High Risks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {riskData?.summary?.byStatus?.open || 0}
                </div>
                <p className="text-sm text-muted-foreground">Open Risks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {riskData?.summary?.overdueMitigations || 0}
                </div>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessments */}
          <div className="space-y-4">
            {riskData?.assessments?.map((risk) => (
              <Card key={risk.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{risk.title}</CardTitle>
                      <CardDescription>Category: {risk.category}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRiskLevelColor(risk.riskScore)}>
                        Risk Score: {risk.riskScore}
                      </Badge>
                      <Badge variant="outline">{risk.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium">{risk.owner}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(risk.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{risk.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <p className="font-medium">
                        {risk.riskScore >= 20 ? 'Critical' :
                         risk.riskScore >= 15 ? 'High' :
                         risk.riskScore >= 10 ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          {/* Policy Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{policiesData?.summary?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {policiesData?.summary?.bySeverity?.critical || 0}
                </div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {policiesData?.summary?.totalViolations || 0}
                </div>
                <p className="text-sm text-muted-foreground">Violations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {policiesData?.summary?.policiesNeedingReview || 0}
                </div>
                <p className="text-sm text-muted-foreground">Need Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {policiesData?.summary?.byCategory?.security || 0}
                </div>
                <p className="text-sm text-muted-foreground">Security</p>
              </CardContent>
            </Card>
          </div>

          {/* Policies List */}
          <div className="space-y-4">
            {policiesData?.policies?.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <CardDescription>Category: {policy.category}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(policy.severity)}>
                        {policy.severity}
                      </Badge>
                      <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Violations</p>
                      <p className="font-medium text-red-600">{policy.violations}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exemptions</p>
                      <p className="font-medium">{policy.exemptions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium">{policy.id.includes('001') ? 'security-team' : 'ai-ethics-team'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Review</p>
                      <p className="font-medium">
                        {new Date(policy.id.includes('001') ? '2024-12-01' : '2024-11-15').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-ethics" className="space-y-6">
          {/* AI Ethics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{ethicsData?.summary?.totalModels || 1}</div>
                <p className="text-sm text-muted-foreground">Models Assessed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {ethicsData?.summary?.averageFairnessScore || 72}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Fairness Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {ethicsData?.summary?.modelsRequiringRemediation || 1}
                </div>
                <p className="text-sm text-muted-foreground">Need Remediation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {ethicsData?.summary?.byFairnessLevel?.good || 0}
                </div>
                <p className="text-sm text-muted-foreground">Good Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Ethics Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>AI Ethics Guidelines</CardTitle>
              <CardDescription>Established fairness and bias thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-xl font-bold text-blue-600">80%</div>
                  <div className="text-sm text-muted-foreground">Fairness Threshold</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-xl font-bold text-green-600">0.1</div>
                  <div className="text-sm text-muted-foreground">Bias Tolerance</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-xl font-bold text-purple-600">Quarterly</div>
                  <div className="text-sm text-muted-foreground">Review Frequency</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-xl font-bold text-orange-600">Required</div>
                  <div className="text-sm text-muted-foreground">Human Oversight</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bias Reports */}
          <div className="space-y-4">
            {ethicsData?.reports?.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.modelName}</CardTitle>
                      <CardDescription>
                        Assessment Date: {new Date(report.assessmentDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={report.overallScore >= 80 ? 'bg-green-500' : 'bg-orange-500'}>
                        {report.overallScore}% Fair
                      </Badge>
                      {report.requiresRemediation && (
                        <Badge variant="destructive">Remediation Required</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Fairness Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Demographic Parity</span>
                        <span className="font-medium">{(report.metrics.demographicParity * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equalized Odds</span>
                        <span className="font-medium">{(report.metrics.equalizedOdds * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calibration</span>
                        <span className="font-medium">{(report.metrics.calibration * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Protected Groups Analysis</h4>
                    <div className="space-y-2">
                      {report.protectedGroups.map((group: any, groupIndex: number) => (
                        <div key={groupIndex} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{group.group}</p>
                            <p className="text-sm text-muted-foreground">
                              Representation: {(group.representation * 100).toFixed(1)}%
                            </p>
                          </div>
                          <Badge className={group.fairnessScore >= 0.8 ? 'bg-green-500' : 'bg-orange-500'}>
                            {(group.fairnessScore * 100).toFixed(1)}% Fair
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {report.recommendations && report.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {report.recommendations.slice(0, 3).map((rec: string, recIndex: number) => (
                          <li key={recIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}