import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, Zap, Users, Star } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
  description: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    description: 'Perfect for getting started',
    features: [
      '3 AI projects per month',
      '1 team member',
      'Basic code generation',
      'Community support',
      '1GB storage'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: 'price_pro_monthly',
    description: 'For growing teams and businesses',
    popular: true,
    features: [
      'Unlimited AI projects',
      '10 team members',
      'Advanced AI agents',
      'Priority support',
      '100GB storage',
      'Real-time collaboration',
      'Custom integrations'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceId: 'price_enterprise_monthly',
    description: 'For large organizations',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Custom AI models',
      'Dedicated support',
      '1TB storage',
      'Advanced security',
      'SLA guarantees',
      'Custom deployment',
      'API access'
    ]
  }
];

function PaymentForm({ plan, onSuccess, onCancel }: { 
  plan: Plan; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // Create subscription with Stripe
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planId: plan.id
        })
      });

      const { clientSecret, subscriptionId } = await response.json();

      if (!clientSecret) {
        throw new Error('No client secret received');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your {plan.name} Subscription</CardTitle>
          <CardDescription>
            ${plan.price}/month - {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border rounded-md p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!stripe || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : `Subscribe for $${plan.price}/month`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    if (!isAuthenticated) {
      // Store selected plan and redirect to auth
      localStorage.setItem('selectedPlan', JSON.stringify(plan));
      setLocation('/auth?redirect=pricing');
      return;
    }

    if (plan.id === 'free') {
      // Handle free plan selection
      handleFreePlan();
      return;
    }

    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleFreePlan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch('/api/billing/select-free-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update user plan
      if (user) {
        const updatedUser = { ...user, plan: 'free' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setLocation('/dashboard');
    } catch (error) {
      console.error('Free plan selection error:', error);
    }
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan && user) {
      const updatedUser = { ...user, plan: selectedPlan.id };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    
    setShowPayment(false);
    setSelectedPlan(null);
    setLocation('/dashboard');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your AI Manifest Engine Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scale your development workflow with our AI-powered platform. 
            From individual developers to enterprise teams.
          </p>
          
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Sign in or create an account to select your plan and start building.
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full ${
                    plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
                </Button>
                
                {user?.plan === plan.id && (
                  <div className="mt-2 text-center">
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Enterprise Features</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-semibold">Lightning Fast</h4>
              <p className="text-sm text-gray-600 text-center">
                Deploy in seconds with our optimized infrastructure
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-semibold">Team Collaboration</h4>
              <p className="text-sm text-gray-600 text-center">
                Real-time collaboration for distributed teams
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-semibold">AI-Powered</h4>
              <p className="text-sm text-gray-600 text-center">
                Advanced AI agents for code generation
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Check className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-semibold">Enterprise Ready</h4>
              <p className="text-sm text-gray-600 text-center">
                SOC2, GDPR compliant with 99.9% uptime
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPayment && selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}
    </div>
  );
}