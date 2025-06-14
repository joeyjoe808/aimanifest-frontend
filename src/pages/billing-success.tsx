import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { CheckCircle, ArrowRight, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AimanifestLogo from '@/components/ui/aimanifest-logo';

export default function BillingSuccess() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      // Fetch session details from backend
      fetch(`/api/billing/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSessionData(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <AimanifestLogo size={32} showText={true} />
            </Link>
            <Link href="/ide">
              <Button variant="outline">Go to IDE</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Success Content */}
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to AIMANIFEST {sessionData?.planName || 'Pro'}! Your subscription is now active and you have access to all premium features.
          </p>
        </div>

        {/* Subscription Details */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">{sessionData?.planName || 'Professional'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">${sessionData?.amount || '29'}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Project Limit:</span>
              <span className="font-semibold">{sessionData?.projectLimit || '10'} projects</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Billing:</span>
              <span className="font-semibold">{sessionData?.nextBilling || 'Next month'}</span>
            </div>
            {sessionData?.subscriptionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription ID:</span>
                <span className="font-mono text-sm">{sessionData.subscriptionId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Start Building</h3>
                  <p className="text-gray-600">Access the AI-powered IDE and create your first project with advanced features.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Explore Premium Features</h3>
                  <p className="text-gray-600">Try advanced AI models, team collaboration, and priority support.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Get Support</h3>
                  <p className="text-gray-600">Need help? Our priority support team is here to assist you.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ide">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
              Launch IDE
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/billing/manage">
            <Button size="lg" variant="outline" className="px-8 py-4">
              <Calendar className="mr-2 h-5 w-5" />
              Manage Subscription
            </Button>
          </Link>
        </div>

        {/* Receipt Information */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>A receipt has been sent to your email address.</p>
          <p>You can manage your subscription and billing at any time from your account settings.</p>
        </div>
      </div>
    </div>
  );
}