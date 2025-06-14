import { Link } from 'wouter';
import { ArrowRight, Code, Zap, Shield, Globe, Users, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartButton } from '@/components/ui/smart-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AimanifestLogo from '@/components/ui/aimanifest-logo';
import PricingSection from '@/components/pricing/PricingSection';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <AimanifestLogo size={32} showText={true} />
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#platform" className="text-gray-600 hover:text-gray-900 transition-colors">Platform</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Choose Your Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 border-gray-300 text-gray-600">
            Enterprise AI Development Platform
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Build Software with
            <span className="brand-accent block">AI Intelligence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform natural language into production-ready code with AIMANIFEST's enterprise-grade AI development platform. 
            Multi-agent orchestration, real-time collaboration, and intelligent code generation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/pricing">
              <Button size="lg" className="brand-cta text-white px-8 py-4 text-lg hover:opacity-90">
                Choose Your Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ide">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                Launch IDE
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8 mx-auto max-w-6xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">10x</div>
                <div className="text-gray-600">Faster Development</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600">Enterprise Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade AI Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete development environment powered by advanced AI agents and real-time collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">AI Code Generation</CardTitle>
                <CardDescription>
                  Transform natural language prompts into production-ready TypeScript, React, and backend code
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">Multi-Agent Orchestration</CardTitle>
                <CardDescription>
                  Coordinate specialized AI agents for frontend, backend, testing, and deployment tasks
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">Enterprise Security</CardTitle>
                <CardDescription>
                  SOC2 compliance, role-based access control, and encrypted data transmission
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">Real-time Collaboration</CardTitle>
                <CardDescription>
                  Live preview, WebSocket-powered updates, and seamless team workflows
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <Activity className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-gray-900">Self-Healing System</CardTitle>
                <CardDescription>
                  Automated error detection, confidence-based fixes, and approval workflows with Slack/email notifications
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">Team Management</CardTitle>
                <CardDescription>
                  Organization controls, user permissions, and enterprise billing management
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle className="text-gray-900">Smart Integrations</CardTitle>
                <CardDescription>
                  GitHub, Slack, Jira integrations with intelligent workflow automation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Development Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and scale applications with AI assistance
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered IDE</h3>
              <p className="text-gray-600 mb-6">
                Built-in code editor with intelligent suggestions, real-time collaboration, 
                and seamless integration with our AI agent ecosystem.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <Code className="w-5 h-5 text-blue-600 mr-3" />
                  Syntax highlighting for 50+ languages
                </li>
                <li className="flex items-center">
                  <Zap className="w-5 h-5 text-blue-600 mr-3" />
                  Real-time AI code completion
                </li>
                <li className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-3" />
                  Built-in security scanning
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div className="mb-2"># AI Agent generating React component</div>
                <div className="text-blue-400">export default function Button() &#123;</div>
                <div className="text-yellow-400 ml-4">return (</div>
                <div className="text-white ml-8">&lt;button className="btn-primary"&gt;</div>
                <div className="text-white ml-12">Click me</div>
                <div className="text-white ml-8">&lt;/button&gt;</div>
                <div className="text-yellow-400 ml-4">);</div>
                <div className="text-blue-400">&#125;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Development?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers and teams building the future with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-4 text-lg">
                Book Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <AimanifestLogo size={32} showText={true} className="mb-4" />
              <p className="text-gray-400">
                Enterprise AI development platform for the modern software team.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/ide" className="hover:text-white">IDE</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AIMANIFEST. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}