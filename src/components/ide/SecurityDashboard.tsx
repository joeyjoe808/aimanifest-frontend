import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Eye, 
  Lock,
  TrendingUp,
  Users,
  FileText,
  Clock
} from 'lucide-react';

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  rateLimit: {
    current: number;
    limit: number;
    windowMs: number;
  };
  costTracking: {
    daily: number;
    weekly: number;
    monthly: number;
    thresholds: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  threats: {
    maliciousPrompts: number;
    suspiciousIps: number;
    contentViolations: number;
  };
  auditLogs: Array<{
    id: number;
    timestamp: string;
    action: string;
    severity: 'low' | 'medium' | 'high';
    details: string;
  }>;
}

export default function SecurityDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const { data: metrics, isLoading } = useQuery<SecurityMetrics>({
    queryKey: ['/api/security/metrics', selectedTimeRange],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const costUtilization = metrics ? {
    daily: (metrics.costTracking.daily / metrics.costTracking.thresholds.daily) * 100,
    weekly: (metrics.costTracking.weekly / metrics.costTracking.thresholds.weekly) * 100,
    monthly: (metrics.costTracking.monthly / metrics.costTracking.thresholds.monthly) * 100
  } : { daily: 0, weekly: 0, monthly: 0 };

  const threatLevel = metrics ? 
    metrics.threats.maliciousPrompts + metrics.threats.suspiciousIps + metrics.threats.contentViolations : 0;

  const getThreatSeverity = (level: number): 'low' | 'medium' | 'high' => {
    if (level >= 10) return 'high';
    if (level >= 5) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor platform security, costs, and usage</p>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Security Alerts */}
      {threatLevel > 5 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Threat Activity Detected</AlertTitle>
          <AlertDescription>
            {threatLevel} security events detected in the last {selectedTimeRange}. 
            Review the audit logs for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.blockedRequests || 0} blocked ({
                metrics?.totalRequests ? 
                  ((metrics.blockedRequests / metrics.totalRequests) * 100).toFixed(1) : 0
              }%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((metrics?.costTracking.monthly || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {costUtilization.monthly.toFixed(1)}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={
                getThreatSeverity(threatLevel) === 'high' ? 'destructive' :
                getThreatSeverity(threatLevel) === 'medium' ? 'default' : 'secondary'
              }>
                {getThreatSeverity(threatLevel).toUpperCase()}
              </Badge>
              <span className="text-2xl font-bold">{threatLevel}</span>
            </div>
            <p className="text-xs text-muted-foreground">Security events detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.rateLimit.current || 0}/{metrics?.rateLimit.limit || 100}
            </div>
            <Progress 
              value={metrics?.rateLimit.current && metrics?.rateLimit.limit ? 
                (metrics.rateLimit.current / metrics.rateLimit.limit) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="costs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="costs">Cost Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Usage</CardTitle>
                <CardDescription>
                  ${((metrics?.costTracking.daily || 0) / 100).toFixed(2)} / 
                  ${((metrics?.costTracking.thresholds.daily || 0) / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={costUtilization.daily} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {costUtilization.daily.toFixed(1)}% of daily limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Usage</CardTitle>
                <CardDescription>
                  ${((metrics?.costTracking.weekly || 0) / 100).toFixed(2)} / 
                  ${((metrics?.costTracking.thresholds.weekly || 0) / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={costUtilization.weekly} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {costUtilization.weekly.toFixed(1)}% of weekly limit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Usage</CardTitle>
                <CardDescription>
                  ${((metrics?.costTracking.monthly || 0) / 100).toFixed(2)} / 
                  ${((metrics?.costTracking.thresholds.monthly || 0) / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={costUtilization.monthly} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {costUtilization.monthly.toFixed(1)}% of monthly limit
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Malicious Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {metrics?.threats.maliciousPrompts || 0}
                </div>
                <p className="text-sm text-muted-foreground">Detected and blocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  Suspicious IPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {metrics?.threats.suspiciousIps || 0}
                </div>
                <p className="text-sm text-muted-foreground">Under monitoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  Content Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {metrics?.threats.contentViolations || 0}
                </div>
                <p className="text-sm text-muted-foreground">Policy violations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <CardDescription>Security-related activities and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        log.severity === 'high' ? 'destructive' :
                        log.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {log.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">No audit logs available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Analysis</CardTitle>
              <CardDescription>Advanced security monitoring and threat detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Security Status: {getThreatSeverity(threatLevel).toUpperCase()}</AlertTitle>
                  <AlertDescription>
                    The platform is actively monitoring for security threats. 
                    All requests are scanned for malicious content and suspicious patterns.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Active Protections</h4>
                    <ul className="space-y-1 text-sm">
                      <li>✓ Rate limiting and DDoS protection</li>
                      <li>✓ Input sanitization and validation</li>
                      <li>✓ Content moderation scanning</li>
                      <li>✓ API key encryption and isolation</li>
                      <li>✓ Real-time threat detection</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Compliance Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li>✓ GDPR data protection compliance</li>
                      <li>✓ CCPA privacy rights support</li>
                      <li>✓ SOC 2 security controls</li>
                      <li>✓ DMCA takedown process</li>
                      <li>✓ Comprehensive audit logging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}