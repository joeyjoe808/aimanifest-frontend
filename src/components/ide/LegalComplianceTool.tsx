import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  Globe, 
  Eye, 
  Lock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Copy,
  Gavel,
  Scale,
  UserCheck,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  category: 'privacy' | 'accessibility' | 'copyright' | 'terms' | 'international';
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'needs-review' | 'in-progress';
  description: string;
  actions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastChecked: string;
}

interface LegalDocument {
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'cookies' | 'accessibility' | 'disclaimer';
  content: string;
  lastUpdated: string;
  version: string;
  status: 'draft' | 'published' | 'requires-update';
}

export default function LegalComplianceTool() {
  const [activeTab, setActiveTab] = useState('overview');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'AI Development Platform Inc.',
    address: '123 Technology Drive, San Francisco, CA 94105',
    email: 'legal@aidevplatform.com',
    website: 'https://aidevplatform.com'
  });

  const complianceChecks: ComplianceCheck[] = [
    {
      id: 'gdpr-compliance',
      category: 'privacy',
      requirement: 'GDPR Compliance (EU)',
      status: 'compliant',
      description: 'General Data Protection Regulation compliance for EU users',
      actions: ['Data processing agreement', 'Right to deletion', 'Data portability', 'Consent management'],
      severity: 'critical',
      lastChecked: '2 hours ago'
    },
    {
      id: 'ccpa-compliance',
      category: 'privacy',
      requirement: 'CCPA Compliance (California)',
      status: 'compliant',
      description: 'California Consumer Privacy Act compliance',
      actions: ['Do not sell opt-out', 'Data disclosure', 'Deletion rights'],
      severity: 'high',
      lastChecked: '2 hours ago'
    },
    {
      id: 'ada-compliance',
      category: 'accessibility',
      requirement: 'ADA Section 508 Compliance',
      status: 'needs-review',
      description: 'Americans with Disabilities Act accessibility compliance',
      actions: ['Screen reader compatibility', 'Keyboard navigation', 'Color contrast', 'Alt text'],
      severity: 'high',
      lastChecked: '1 day ago'
    },
    {
      id: 'wcag-compliance',
      category: 'accessibility',
      requirement: 'WCAG 2.1 AA Standards',
      status: 'in-progress',
      description: 'Web Content Accessibility Guidelines Level AA',
      actions: ['Focus indicators', 'Text alternatives', 'Responsive design', 'Time limits'],
      severity: 'medium',
      lastChecked: '1 day ago'
    },
    {
      id: 'copyright-notices',
      category: 'copyright',
      requirement: 'Copyright and Attribution',
      status: 'compliant',
      description: 'Proper copyright notices for code and content',
      actions: ['Open source licenses', 'Third-party attributions', 'DMCA policy'],
      severity: 'medium',
      lastChecked: '3 hours ago'
    },
    {
      id: 'terms-clarity',
      category: 'terms',
      requirement: 'Clear Terms of Service',
      status: 'compliant',
      description: 'Comprehensive and legally sound terms of service',
      actions: ['User obligations', 'Service limitations', 'Dispute resolution'],
      severity: 'high',
      lastChecked: '1 hour ago'
    }
  ];

  const legalDocuments: LegalDocument[] = [
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      type: 'terms',
      content: `# Terms of Service

## 1. Acceptance of Terms
By accessing and using the AI Development Platform ("Service"), you accept and agree to be bound by these Terms of Service.

## 2. Service Description
Our Service provides AI-powered software development tools including:
- Natural language to code generation
- Real-time application building
- Deployment and hosting services
- Collaborative development environment

## 3. User Accounts and Responsibilities
- Users must provide accurate registration information
- Users are responsible for maintaining account security
- Users must not use the Service for illegal activities
- Users retain ownership of their generated code and applications

## 4. Acceptable Use Policy
Prohibited activities include:
- Generating malicious or harmful code
- Violating intellectual property rights
- Attempting to reverse engineer our AI models
- Excessive API usage that impacts service performance

## 5. Privacy and Data Protection
- We collect and process data in accordance with our Privacy Policy
- User code and data are encrypted and stored securely
- We do not claim ownership of user-generated content
- Data may be used to improve our AI models (with consent)

## 6. Intellectual Property
- The Service and underlying technology remain our property
- Users grant us limited rights to process their data
- Generated code belongs to the user
- We respect all applicable copyright and trademark laws

## 7. Service Availability and Modifications
- We strive for 99.9% uptime but cannot guarantee continuous availability
- We may modify features with reasonable notice
- Critical security updates may be applied immediately
- Users will be notified of significant changes

## 8. Limitation of Liability
- Service is provided "as is" without warranties
- We are not liable for indirect or consequential damages
- Our liability is limited to the amount paid for the Service
- Users are responsible for backing up their data

## 9. Termination
- Either party may terminate the agreement with 30 days notice
- We may terminate immediately for violations of these terms
- Upon termination, users retain access to their data for 90 days
- Deleted data cannot be recovered after the retention period

## 10. Dispute Resolution
- Disputes will be resolved through binding arbitration
- Arbitration will be conducted under American Arbitration Association rules
- Class action lawsuits are waived
- Applicable law is the State of California

Last Updated: ${new Date().toLocaleDateString()}`,
      lastUpdated: new Date().toLocaleDateString(),
      version: '2.1',
      status: 'published'
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      type: 'privacy',
      content: `# Privacy Policy

## Information We Collect

### Account Information
- Email address and username
- Profile information (optional)
- Billing and payment information

### Usage Data
- Code generated through our platform
- Application configurations and settings
- Usage patterns and feature interactions
- Technical logs and error reports

### Device and Technical Information
- IP address and location data
- Browser type and version
- Device identifiers
- Performance metrics

## How We Use Your Information

### Service Provision
- Generate and compile code based on your requests
- Provide real-time development environment
- Process payments and manage subscriptions
- Deliver customer support

### Service Improvement
- Analyze usage patterns to enhance features
- Train and improve AI models (with explicit consent)
- Develop new functionality and tools
- Ensure security and prevent abuse

### Communication
- Send service updates and notifications
- Provide customer support responses
- Share important policy changes
- Marketing communications (opt-in only)

## Information Sharing and Disclosure

We do not sell personal information. We may share data only in these circumstances:

### Service Providers
- Cloud hosting and infrastructure partners
- Payment processing services
- Analytics and monitoring tools
- Customer support platforms

### Legal Requirements
- Compliance with applicable laws
- Response to valid legal requests
- Protection of our rights and safety
- Prevention of fraud and abuse

## Data Security

### Technical Safeguards
- End-to-end encryption for sensitive data
- Regular security audits and penetration testing
- Multi-factor authentication requirements
- Automated threat detection and response

### Organizational Measures
- Employee privacy training and access controls
- Data processing agreements with partners
- Regular compliance reviews and updates
- Incident response and breach notification procedures

## Your Rights and Choices

### Data Access and Portability
- Request copies of your personal data
- Export generated code and applications
- Receive data in machine-readable formats
- Transfer data to other services

### Data Correction and Deletion
- Update or correct inaccurate information
- Delete your account and associated data
- Opt-out of data processing for AI training
- Request erasure under applicable privacy laws

### Communication Preferences
- Unsubscribe from marketing emails
- Control notification settings
- Manage cookie preferences
- Opt-out of analytics tracking

## International Data Transfers

- Data may be processed in the United States and other countries
- We use Standard Contractual Clauses for EU data transfers
- Adequacy decisions and other legal mechanisms ensure protection
- Users can request information about specific transfer safeguards

## Children's Privacy

- Our Service is not intended for users under 13
- We do not knowingly collect children's personal information
- Parents can request deletion of child data
- We implement additional protections for users under 18

## Changes to This Policy

- We will notify users of material changes
- Continued use constitutes acceptance of updates
- Previous versions are archived and available upon request
- Users can terminate their account if they disagree with changes

## Contact Information

For privacy-related questions or requests:
- Email: privacy@aidevplatform.com
- Phone: 1-800-PRIVACY
- Address: 123 Technology Drive, San Francisco, CA 94105
- Data Protection Officer: dpo@aidevplatform.com

Last Updated: ${new Date().toLocaleDateString()}`,
      lastUpdated: new Date().toLocaleDateString(),
      version: '3.0',
      status: 'published'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': 
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-review': 
      case 'requires-update': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non-compliant': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': 
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'privacy': return <Lock className="h-4 w-4" />;
      case 'accessibility': return <UserCheck className="h-4 w-4" />;
      case 'copyright': return <FileText className="h-4 w-4" />;
      case 'terms': return <Gavel className="h-4 w-4" />;
      case 'international': return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const runComplianceCheck = async () => {
    // Simulate compliance checking
    console.log('Running comprehensive compliance check...');
  };

  const generateDocument = (type: string) => {
    console.log(`Generating ${type} document...`);
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Legal & Compliance Center</h3>
          <Badge variant="outline" className="text-purple-600">Enterprise Grade</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={runComplianceCheck}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Compliance Check
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="documents">Legal Documents</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Compliance Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">4</div>
                      <div className="text-sm text-green-800">Compliant</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">2</div>
                      <div className="text-sm text-yellow-800">Needs Review</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {complianceChecks.slice(0, 3).map(check => (
                      <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(check.category)}
                          <div>
                            <div className="font-medium">{check.requirement}</div>
                            <div className="text-sm text-gray-600">{check.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`border ${getSeverityColor(check.severity)}`}>
                            {check.severity}
                          </Badge>
                          <Badge className={`border ${getStatusColor(check.status)}`}>
                            {check.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Legal Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Privacy Policy Updated</div>
                        <div className="text-sm text-gray-600">Added new data retention policies</div>
                      </div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">GDPR Compliance Verified</div>
                        <div className="text-sm text-gray-600">All requirements met for EU operations</div>
                      </div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input 
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Legal Address</label>
                    <Textarea 
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Legal Contact Email</label>
                    <Input 
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Website URL</label>
                    <Input 
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => generateDocument('terms')}>
                    Generate Terms of Service
                  </Button>
                  <Button className="w-full" onClick={() => generateDocument('privacy')}>
                    Generate Privacy Policy
                  </Button>
                  <Button className="w-full" onClick={() => generateDocument('accessibility')}>
                    Create Accessibility Statement
                  </Button>
                  <Button className="w-full" onClick={() => generateDocument('cookies')}>
                    Generate Cookie Policy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Protection Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.filter(check => check.category === 'privacy').map(check => (
                    <div key={check.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{check.requirement}</h4>
                        <Badge className={`border ${getStatusColor(check.status)}`}>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                      <div className="space-y-2">
                        {check.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Processing Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">User Account Data</h4>
                    <p className="text-sm text-gray-600 mb-2">Email, username, profile information</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Consent</Badge>
                      <Badge variant="outline">Contract</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Generated Code</h4>
                    <p className="text-sm text-gray-600 mb-2">User-created applications and code</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Legitimate Interest</Badge>
                      <Badge variant="outline">User Ownership</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Usage Analytics</h4>
                    <p className="text-sm text-gray-600 mb-2">Platform usage patterns and metrics</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Legitimate Interest</Badge>
                      <Badge variant="outline">Pseudonymized</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Accessibility Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.filter(check => check.category === 'accessibility').map(check => (
                    <div key={check.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{check.requirement}</h4>
                        <Badge className={`border ${getStatusColor(check.status)}`}>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                      <div className="space-y-2">
                        {check.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {check.status === 'compliant' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2 text-green-800">✓ Implemented</h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• High contrast color schemes</li>
                      <li>• Keyboard navigation support</li>
                      <li>• Screen reader compatibility</li>
                      <li>• Text scaling up to 200%</li>
                      <li>• Focus indicators</li>
                      <li>• Alternative text for images</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <h4 className="font-medium mb-2 text-yellow-800">⚠ In Progress</h4>
                    <ul className="text-sm space-y-1 text-yellow-700">
                      <li>• Voice navigation controls</li>
                      <li>• Enhanced color contrast ratios</li>
                      <li>• Improved error messaging</li>
                      <li>• Timeout extensions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="space-y-4">
            {legalDocuments.map(doc => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {doc.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                      <span className="text-sm text-gray-500">v{doc.version}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Last updated: {doc.lastUpdated}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{doc.content}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="international" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  International Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">European Union (GDPR)</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Compliant
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Data processing, consent management, and user rights implemented</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">United Kingdom (UK GDPR)</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Compliant
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Post-Brexit data protection requirements covered</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">California (CCPA/CPRA)</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Compliant
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Consumer privacy rights and disclosure requirements met</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Canada (PIPEDA)</h4>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        In Review
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Personal Information Protection requirements under review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Transfer Mechanisms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2">Standard Contractual Clauses</h4>
                    <p className="text-sm text-gray-600">EU-approved clauses for international data transfers</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2">Adequacy Decisions</h4>
                    <p className="text-sm text-gray-600">Transfers to countries with adequate protection levels</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h4 className="font-medium mb-2">Binding Corporate Rules</h4>
                    <p className="text-sm text-gray-600">Internal data protection policies for multinational processing</p>
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