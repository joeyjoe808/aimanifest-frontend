import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Users, Server, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    projects: number;
    apiCalls: number;
    storage: number;
    teamMembers: number;
  };
}

interface Organization {
  id: string;
  name: string;
  planId: string;
  usage: {
    projects: number;
    apiCalls: number;
    storage: number;
    lastResetAt: string;
  };
  billing: {
    currentPeriodStart: string;
    currentPeriodEnd: string;
    status: 'active' | 'past_due' | 'canceled' | 'unpaid';
    lastPaymentDate?: string;
    nextPaymentDate?: string;
  };
  members: Array<{
    userId: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }>;
}

export default function SubscriptionDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrgId] = useState('org_1'); // Default to demo organization

  // Fetch subscription plans
  const { data: plansData } = useQuery({
    queryKey: ['/api/subscription/plans'],
  });

  // Fetch organization details
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['/api/subscription/organization', selectedOrgId],
  });

  // Fetch usage analytics
  const { data: usageData } = useQuery({
    queryKey: ['/api/subscription/usage', selectedOrgId],
  });

  // Fetch billing information
  const { data: billingData } = useQuery({
    queryKey: ['/api/subscription/billing', selectedOrgId],
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: (newPlanId: string) => 
      apiRequest('POST', '/api/subscription/upgrade', {
        organizationId: selectedOrgId,
        newPlanId
      }),
    onSuccess: () => {
      toast({
        title: "Subscription Upgraded",
        description: "Your subscription has been successfully upgraded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/organization'] });
    },
    onError: () => {
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const organization = orgData?.organization;
  const currentPlan = orgData?.plan;
  const usagePercentages = orgData?.usagePercentages;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscription, usage, and billing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(organization?.billing?.status || 'active')}>
            {organization?.billing?.status || 'Active'}
          </Badge>
          <Badge variant="outline">
            {currentPlan?.name || 'Professional Plan'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Current Plan: {currentPlan?.name}</span>
              </CardTitle>
              <CardDescription>
                ${currentPlan?.price}/month • Billing period ends {
                  organization?.billing?.currentPeriodEnd ? 
                  new Date(organization.billing.currentPeriodEnd).toLocaleDateString() : 
                  'N/A'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projects</span>
                    <span>
                      {organization?.usage?.projects || 0}
                      {currentPlan?.limits?.projects !== -1 && ` / ${currentPlan?.limits?.projects}`}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentages?.projects || 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>
                      {organization?.usage?.apiCalls?.toLocaleString() || 0}
                      {currentPlan?.limits?.apiCalls !== -1 && ` / ${currentPlan?.limits?.apiCalls?.toLocaleString()}`}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentages?.apiCalls || 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>
                      {organization?.usage?.storage || 0} GB
                      {currentPlan?.limits?.storage !== -1 && ` / ${currentPlan?.limits?.storage} GB`}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentages?.storage || 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Members</span>
                    <span>
                      {organization?.members?.length || 0}
                      {currentPlan?.limits?.teamMembers !== -1 && ` / ${currentPlan?.limits?.teamMembers}`}
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentages?.teamMembers || 0} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Usage Recommendations */}
              {usageData?.recommendations && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {usageData.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members ({organization?.members?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization?.members?.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Track your resource consumption over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageData?.usageHistory ? (
                <div className="space-y-6">
                  {/* Usage Chart Placeholder */}
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Usage chart visualization</p>
                  </div>
                  
                  {/* Usage Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {organization?.usage?.apiCalls?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">API Calls This Month</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {organization?.usage?.projects || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Projects</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {organization?.usage?.storage || 0} GB
                      </div>
                      <div className="text-sm text-muted-foreground">Storage Used</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading usage data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Subscription */}
              <div>
                <h4 className="font-medium mb-2">Current Subscription</h4>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{currentPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">${currentPlan?.price}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Payment:</span>
                    <span className="font-medium">
                      {organization?.billing?.nextPaymentDate ? 
                        new Date(organization.billing.nextPaymentDate).toLocaleDateString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Invoices */}
              <div>
                <h4 className="font-medium mb-2">Recent Invoices</h4>
                <div className="space-y-2">
                  {billingData?.invoices?.slice(0, 5).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          ${invoice.amount} - {currentPlan?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plansData?.plans?.map((plan: SubscriptionPlan) => (
              <Card key={plan.id} className={plan.id === currentPlan?.id ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.id === currentPlan?.id && (
                      <Badge>Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    {plan.id === currentPlan?.id ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => upgradeMutation.mutate(plan.id)}
                        disabled={upgradeMutation.isPending}
                      >
                        {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}