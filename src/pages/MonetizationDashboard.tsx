import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  Calendar,
  Package,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  basePrice: number;
  currency: string;
  billingCycle: string;
  features: any;
  popular: boolean;
}

interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  churnRate: number;
  lifetimeValue: number;
}

interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  tierId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingAmount: number;
  currency: string;
  autoRenew: boolean;
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
  };
}

export default function MonetizationDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedUserId] = useState('user_demo_001');

  // Fetch pricing tiers
  const { data: pricingData, isLoading: pricingLoading } = useQuery<{
    tiers: PricingTier[];
  }>({
    queryKey: ['pricing-tiers'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/billing/pricing-tiers');
      if (!response.ok) throw new Error('Failed to fetch pricing tiers');
      return response.json();
    }
  });

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery<{
    analytics: RevenueAnalytics;
    revenueByTier: Record<string, number>;
    monthlyTrend: Array<{ month: string; revenue: number; subscriptions: number }>;
  }>({
    queryKey: ['revenue-analytics', selectedPeriod],
    queryFn: async () => {
      const response = await fetch('http://localhost:5001/api/billing/revenue-analytics');
      if (!response.ok) throw new Error('Failed to fetch revenue analytics');
      return response.json();
    }
  });

  // Fetch subscription data
  const { data: subscriptionData } = useQuery<{
    subscription: Subscription;
    usage: any;
  }>({
    queryKey: ['subscription-data', selectedUserId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5001/api/billing/subscription/${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription data');
      return response.json();
    }
  });

  // Fetch invoices
  const { data: invoiceData } = useQuery<{
    invoices: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      dueDate: string;
      paidAt?: string;
      period: { start: string; end: string };
      items: Array<{ description: string; amount: number; type: string }>;
    }>;
    summary: {
      totalPaid: number;
      totalOutstanding: number;
      nextDueDate: string;
    };
  }>({
    queryKey: ['invoices', selectedUserId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5001/api/billing/invoices/${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    }
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'canceled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      case 'open': return 'bg-blue-500';
      case 'void': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (pricingLoading || revenueLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
          <p className="text-gray-600 mt-1">Revenue analytics, subscription management, and billing insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData?.analytics.totalRevenue || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{revenueData?.analytics.revenueGrowth.toFixed(1)}%</span>
              <span className="text-gray-500 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData?.analytics.monthlyRecurringRevenue || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-blue-600 font-medium">Recurring</span>
              <span className="text-gray-500 ml-2">subscription revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold">{revenueData?.analytics.activeSubscriptions || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500 font-medium">+{revenueData?.analytics.newSubscriptions || 0}</span>
              <span className="text-gray-500 ml-2">new this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData?.analytics.averageRevenuePerUser || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-600 font-medium">Churn: {revenueData?.analytics.churnRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Revenue by Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(revenueData?.revenueByTier || {}).map(([tier, revenue]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="capitalize font-medium">{tier}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Monthly Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData?.monthlyTrend?.slice(-4).map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{formatCurrency(month.revenue)}</span>
                        <Badge variant="secondary">{month.subscriptions} subs</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingData?.tiers.map((tier) => (
              <Card key={tier.id} className={`relative ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {formatCurrency(tier.basePrice)}
                    <span className="text-sm font-normal text-gray-500">/{tier.billingCycle}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Requests</span>
                      <span className="font-medium">{tier.features.aiRequests === -1 ? 'Unlimited' : tier.features.aiRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Projects</span>
                      <span className="font-medium">{tier.features.projects === -1 ? 'Unlimited' : tier.features.projects}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Storage</span>
                      <span className="font-medium">{tier.features.storage === -1 ? 'Unlimited' : `${tier.features.storage} GB`}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Users</span>
                      <span className="font-medium">{tier.features.users === -1 ? 'Unlimited' : tier.features.users}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Support</span>
                      <Badge variant="outline" className="capitalize">{tier.features.support}</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-6" variant={tier.popular ? "default" : "outline"}>
                    {tier.popular ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {subscriptionData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plan</label>
                      <p className="text-lg font-semibold capitalize">{subscriptionData.subscription.tierId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="flex items-center mt-1">
                        <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(subscriptionData.subscription.status)}`}></div>
                        <span className="capitalize">{subscriptionData.subscription.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Next Billing</label>
                      <p className="font-medium">{formatDate(subscriptionData.subscription.currentPeriodEnd)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(subscriptionData.subscription.nextBillingAmount)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Method</label>
                      <div className="flex items-center mt-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span className="capitalize">{subscriptionData.subscription.paymentMethod.brand}</span>
                        <span className="ml-2">•••• {subscriptionData.subscription.paymentMethod.last4}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Auto Renew</label>
                      <div className="flex items-center mt-1">
                        {subscriptionData.subscription.autoRenew ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <span>{subscriptionData.subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {subscriptionData?.usage && (
            <Card>
              <CardHeader>
                <CardTitle>Usage This Period</CardTitle>
                <CardDescription>Current usage vs plan limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI Requests</span>
                      <span className="text-sm text-gray-500">
                        {subscriptionData.usage.metrics.aiRequests.toLocaleString()} / {subscriptionData.usage.limits.aiRequestsPerMonth === -1 ? 'Unlimited' : subscriptionData.usage.limits.aiRequestsPerMonth.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={subscriptionData.usage.limits.aiRequestsPerMonth === -1 ? 0 : (subscriptionData.usage.metrics.aiRequests / subscriptionData.usage.limits.aiRequestsPerMonth) * 100} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-gray-500">
                        {subscriptionData.usage.metrics.storageUsed} GB / {subscriptionData.usage.limits.storageGB === -1 ? 'Unlimited' : `${subscriptionData.usage.limits.storageGB} GB`}
                      </span>
                    </div>
                    <Progress value={subscriptionData.usage.limits.storageGB === -1 ? 0 : (subscriptionData.usage.metrics.storageUsed / subscriptionData.usage.limits.storageGB) * 100} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-sm text-gray-500">
                        {subscriptionData.usage.metrics.activeUsers} / {subscriptionData.usage.limits.usersMax === -1 ? 'Unlimited' : subscriptionData.usage.limits.usersMax}
                      </span>
                    </div>
                    <Progress value={subscriptionData.usage.limits.usersMax === -1 ? 0 : (subscriptionData.usage.metrics.activeUsers / subscriptionData.usage.limits.usersMax) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Invoice History
              </CardTitle>
              <CardDescription>
                Total Paid: {formatCurrency(invoiceData?.summary.totalPaid || 0)} • 
                Outstanding: {formatCurrency(invoiceData?.summary.totalOutstanding || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceData?.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(invoice.status)}`}></div>
                      <div>
                        <p className="font-medium">{invoice.items[0]?.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(invoice.period.start)} - {formatDate(invoice.period.end)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
                      <p className="text-sm text-gray-500 capitalize">{invoice.status}</p>
                      {invoice.paidAt && (
                        <p className="text-xs text-gray-400">Paid {formatDate(invoice.paidAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Lifetime Value</span>
                    <span className="font-semibold">{formatCurrency(revenueData?.analytics.lifetimeValue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <span className="font-semibold">{revenueData?.analytics.churnRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <span className="font-semibold text-green-600">+{revenueData?.analytics.revenueGrowth.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Subscriptions</span>
                    <span className="font-semibold">{revenueData?.analytics.newSubscriptions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Revenue Target</span>
                      <span className="text-sm text-gray-500">85% achieved</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subscription Goals</span>
                      <span className="text-sm text-gray-500">92% achieved</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Retention Rate</span>
                      <span className="text-sm text-gray-500">96% achieved</span>
                    </div>
                    <Progress value={96} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}