import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Zap, GitCommit, Slack, Mail, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HealingLogEntry {
  id: number;
  status: string;
  description: string;
  riskLevel?: string;
  affectedFiles?: string[];
  executionTime?: number;
  timestamp: string;
  approvalRequired?: boolean;
  requiresReview?: boolean;
}

interface PendingFix {
  id: string;
  description: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  files: Array<{
    path: string;
    changes: Array<{
      type: 'replace' | 'insert' | 'delete';
      line?: number;
      oldCode?: string;
      newCode: string;
    }>;
  }>;
  projectId: string;
  timestamp: string;
}

export default function SelfHealDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch healing history
  const { data: healingHistory = [], isLoading: historyLoading } = useQuery<HealingLogEntry[]>({
    queryKey: ['/api/self-heal/logs'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pending fixes
  const { data: pendingFixes = [], isLoading: pendingLoading } = useQuery<PendingFix[]>({
    queryKey: ['/api/self-heal/pending-fixes'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Manual healing trigger
  const manualHealMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/self-heal/trigger'),
    onSuccess: () => {
      toast({
        title: 'Self-Healing Triggered',
        description: 'Manual healing process initiated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/self-heal/logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Trigger Failed',
        description: 'Failed to start manual healing process',
        variant: 'destructive',
      });
    },
  });

  // Approve fix mutation
  const approveMutation = useMutation({
    mutationFn: ({ fixId, token }: { fixId: string; token: string }) =>
      apiRequest('POST', `/api/self-heal/approve/${fixId}`, { token }),
    onSuccess: () => {
      toast({
        title: 'Fix Approved',
        description: 'Fix has been approved and deployed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/self-heal/pending-fixes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/self-heal/logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve fix',
        variant: 'destructive',
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fix_proposed':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'deployed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fix_proposed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const recentActivity = healingHistory.slice(0, 5);
  const healthyCount = healingHistory.filter((entry: HealingLogEntry) => entry.status === 'healthy').length;
  const deployedCount = healingHistory.filter((entry: HealingLogEntry) => entry.status === 'deployed').length;
  const failedCount = healingHistory.filter((entry: HealingLogEntry) => entry.status === 'failed').length;
  const totalHealing = healingHistory.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Self-Healing Control Center</h1>
          <p className="text-muted-foreground">
            Enterprise-grade automated error detection and recovery system
          </p>
        </div>
        <Button
          onClick={() => manualHealMutation.mutate()}
          disabled={manualHealMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="h-4 w-4 mr-2" />
          {manualHealMutation.isPending ? 'Triggering...' : 'Trigger Manual Heal'}
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Auto-healing every 5 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingFixes.length}</div>
            <p className="text-xs text-muted-foreground">
              High-risk fixes awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Deployments</CardTitle>
            <GitCommit className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deployedCount}</div>
            <p className="text-xs text-muted-foreground">
              Automated fixes deployed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalHealing > 0 ? Math.round(((healthyCount + deployedCount) / totalHealing) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall healing success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Healing Activity</CardTitle>
              <CardDescription>
                Latest self-healing events and system status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No healing activity recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((entry: HealingLogEntry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(entry.status)}
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status.replace('_', ' ')}
                            </Badge>
                            {entry.riskLevel && (
                              <Badge className={getRiskColor(entry.riskLevel)}>
                                {entry.riskLevel} risk
                              </Badge>
                            )}
                            {entry.approvalRequired && (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Approval Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(entry.timestamp).toLocaleString()}</div>
                        {entry.executionTime && (
                          <div>{entry.executionTime}ms</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Fix Approvals</CardTitle>
              <CardDescription>
                High-risk fixes requiring manual approval before deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pendingFixes.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No pending approvals at this time
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingFixes.map((fix: PendingFix) => (
                    <div key={fix.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{fix.description}</h4>
                          <p className="text-sm text-muted-foreground">Project: {fix.projectId}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRiskColor(fix.riskLevel)}>
                            {fix.riskLevel} risk
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(fix.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Affected Files:</div>
                        <div className="flex flex-wrap gap-1">
                          {fix.files.map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {file.path}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Progress value={fix.confidence * 100} className="w-full" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(fix.timestamp).toLocaleString()}
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // In a real implementation, you'd have the approval token
                              // For demo purposes, we'll show how the approval would work
                              toast({
                                title: 'Approval Process',
                                description: 'In production, this would use the secure approval token from email',
                              });
                            }}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email Approval
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Demo approval - in production this would require proper token
                              toast({
                                title: 'Demo Mode',
                                description: 'Approval system ready - use email token in production',
                              });
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Quick Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure alerts and approval notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Slack className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Slack Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Real-time healing alerts and approval requests
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Email Approvals</h4>
                      <p className="text-sm text-muted-foreground">
                        Secure approval workflow for high-risk fixes
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Configured</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GitCommit className="h-6 w-6 text-orange-600" />
                    <div>
                      <h4 className="font-medium">GitHub Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Automated commits and deployment webhooks
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Self-Healing Configuration</CardTitle>
              <CardDescription>
                Advanced settings for automated error detection and recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidence Threshold</label>
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-semibold">85%</div>
                    <p className="text-xs text-muted-foreground">
                      Minimum confidence for auto-deployment
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Healing Interval</label>
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-semibold">5 minutes</div>
                    <p className="text-xs text-muted-foreground">
                      Automated scanning frequency
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Assessment</label>
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-semibold">Advanced</div>
                    <p className="text-xs text-muted-foreground">
                      Multi-factor risk evaluation
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Approval Mode</label>
                  <div className="p-3 border rounded-lg">
                    <div className="text-lg font-semibold">Email + Slack</div>
                    <p className="text-xs text-muted-foreground">
                      Dual-channel approval workflow
                    </p>
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