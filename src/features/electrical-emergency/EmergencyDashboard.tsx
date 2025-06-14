import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Zap,
  DollarSign,
  FileText,
  Calendar,
  Truck,
  Settings,
  TrendingUp
} from 'lucide-react';

interface EmergencyCall {
  id: number;
  callId: string;
  customerId: number;
  customer?: {
    contactName: string;
    phone: string;
    companyName?: string;
  };
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  issueDescription: string;
  reportedBy: string;
  contactPhone: string;
  siteLocation: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    buildingDetails?: string;
  };
  callReceived: string;
  estimatedResolution?: string;
  status: 'pending' | 'assigned' | 'en_route' | 'on_site' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  specialInstructions?: string;
  safetyHazards?: string[];
}

interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  skillLevel: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface ServiceQuote {
  id: number;
  quoteNumber: string;
  customerId: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  validUntil: string;
  serviceItems: Array<{
    serviceName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

export default function EmergencyDashboard() {
  const [activeTab, setActiveTab] = useState('emergency-calls');
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [newCallDialogOpen, setNewCallDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch emergency calls
  const { data: emergencyCalls, isLoading: callsLoading } = useQuery({
    queryKey: ['/api/electrical/emergency-calls'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch available technicians
  const { data: technicians } = useQuery({
    queryKey: ['/api/electrical/technicians/available']
  });

  // Fetch service quotes
  const { data: quotes } = useQuery({
    queryKey: ['/api/electrical/quotes']
  });

  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ['/api/electrical/dashboard-metrics'],
    refetchInterval: 60000
  });

  // Create new emergency call
  const createCallMutation = useMutation({
    mutationFn: (callData: any) => apiRequest('POST', '/api/electrical/emergency-calls', callData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/electrical/emergency-calls'] });
      setNewCallDialogOpen(false);
      toast({
        title: "Emergency Call Created",
        description: "New emergency call has been logged and dispatched"
      });
    }
  });

  // Assign technician to call
  const assignTechnicianMutation = useMutation({
    mutationFn: ({ callId, technicianId, serviceId }: any) => 
      apiRequest('POST', '/api/electrical/assignments', { callId, technicianId, serviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/electrical/emergency-calls'] });
      toast({
        title: "Technician Assigned",
        description: "Emergency call has been assigned to technician"
      });
    }
  });

  // Generate quote
  const generateQuoteMutation = useMutation({
    mutationFn: (quoteData: any) => apiRequest('POST', '/api/electrical/quotes', quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/electrical/quotes'] });
      setQuoteDialogOpen(false);
      toast({
        title: "Quote Generated",
        description: "Service quote has been created and can be sent to customer"
      });
    }
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Mock data for demonstration
  const mockCalls: EmergencyCall[] = [
    {
      id: 1,
      callId: 'EMG-2024-001',
      customerId: 1,
      customer: {
        contactName: 'John Smith',
        phone: '(555) 123-4567',
        companyName: 'Smith Manufacturing'
      },
      urgencyLevel: 'critical',
      issueDescription: 'Complete power outage in main production facility. All machinery down.',
      reportedBy: 'John Smith',
      contactPhone: '(555) 123-4567',
      siteLocation: {
        street: '123 Industrial Blvd',
        city: 'Manufacturing City',
        state: 'TX',
        zipCode: '75001',
        buildingDetails: 'Main production building, entrance via loading dock'
      },
      callReceived: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'assigned',
      priority: 1,
      specialInstructions: 'High voltage equipment - certified electrician required',
      safetyHazards: ['High voltage', 'Industrial machinery', 'Confined spaces']
    },
    {
      id: 2,
      callId: 'EMG-2024-002',
      customerId: 2,
      customer: {
        contactName: 'Sarah Johnson',
        phone: '(555) 987-6543'
      },
      urgencyLevel: 'high',
      issueDescription: 'Electrical panel sparking and burning smell in office building',
      reportedBy: 'Sarah Johnson',
      contactPhone: '(555) 987-6543',
      siteLocation: {
        street: '456 Business Park Dr',
        city: 'Downtown',
        state: 'TX',
        zipCode: '75002'
      },
      callReceived: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      status: 'en_route',
      priority: 2
    },
    {
      id: 3,
      callId: 'EMG-2024-003',
      customerId: 3,
      customer: {
        contactName: 'Mike Wilson',
        phone: '(555) 456-7890'
      },
      urgencyLevel: 'medium',
      issueDescription: 'Intermittent power loss in residential home',
      reportedBy: 'Mike Wilson',
      contactPhone: '(555) 456-7890',
      siteLocation: {
        street: '789 Residential St',
        city: 'Suburbia',
        state: 'TX',
        zipCode: '75003'
      },
      callReceived: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 3
    }
  ];

  const mockTechnicians: Technician[] = [
    {
      id: 1,
      firstName: 'Alex',
      lastName: 'Rodriguez',
      skillLevel: 'master',
      isAvailable: true
    },
    {
      id: 2,
      firstName: 'Jessica',
      lastName: 'Chen',
      skillLevel: 'journeyman',
      isAvailable: true
    },
    {
      id: 3,
      firstName: 'David',
      lastName: 'Thompson',
      skillLevel: 'master',
      isAvailable: false
    }
  ];

  const mockMetrics = {
    totalCalls: 156,
    activeCalls: 12,
    averageResponseTime: 18,
    completionRate: 94.5,
    revenueThisMonth: 127500,
    pendingQuotes: 8
  };

  const calls = emergencyCalls || mockCalls;
  const availableTechnicians = technicians || mockTechnicians;
  const dashboardMetrics = metrics || mockMetrics;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Electrical Emergency Services
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time emergency dispatch and service management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={newCallDialogOpen} onOpenChange={setNewCallDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Phone className="w-4 h-4 mr-2" />
                New Emergency Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Emergency Call</DialogTitle>
              </DialogHeader>
              <NewCallForm onSubmit={(data) => createCallMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Calls</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {dashboardMetrics?.totalCalls || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Calls</p>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardMetrics?.activeCalls || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Response</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardMetrics?.averageResponseTime || 0}m
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardMetrics?.completionRate || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Revenue MTD</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardMetrics?.revenueThisMonth || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Quotes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardMetrics?.pendingQuotes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emergency-calls">Emergency Calls</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="quotes">Quotes & Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="emergency-calls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Active Emergency Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading emergency calls...
                </div>
              ) : (
                <div className="space-y-4">
                  {(calls || []).map((call: EmergencyCall) => (
                    <div key={call.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getUrgencyColor(call.urgencyLevel)}>
                            {call.urgencyLevel.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(call.status)}>
                            {call.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium text-slate-600">
                            {call.callId}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCall(call)}
                          >
                            View Details
                          </Button>
                          {call.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                // Assign to first available technician
                                const availableTech = (availableTechnicians || []).find((t: any) => t.isAvailable);
                                if (availableTech) {
                                  assignTechnicianMutation.mutate({
                                    callId: call.id,
                                    technicianId: availableTech.id,
                                    serviceId: 1
                                  });
                                }
                              }}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Assign Tech
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Customer: {call.customer?.contactName || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {call.customer?.companyName && `${call.customer.companyName} • `}
                            {call.contactPhone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Location
                          </p>
                          <p className="text-sm text-slate-600">
                            {call.siteLocation?.street || 'Unknown'}, {call.siteLocation?.city || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Received
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(call.callReceived).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          Issue Description
                        </p>
                        <p className="text-sm text-slate-600">
                          {call.issueDescription}
                        </p>
                      </div>

                      {call.safetyHazards && call.safetyHazards.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-600 mb-1">
                            Safety Hazards
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {call.safetyHazards.map((hazard, index) => (
                              <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                                {hazard}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Technician Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(availableTechnicians || []).map((tech: Technician) => (
                  <div key={tech.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {tech.firstName} {tech.lastName}
                        </h4>
                        <p className="text-sm text-slate-600 capitalize">
                          {tech.skillLevel} Electrician
                        </p>
                      </div>
                      <Badge className={tech.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {tech.isAvailable ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Current Status:</span>
                        <span className="font-medium">
                          {tech.isAvailable ? 'Ready for dispatch' : 'On service call'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Skill Level:</span>
                        <span className="font-medium capitalize">{tech.skillLevel}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Button size="sm" variant="outline" className="w-full">
                        <MapPin className="w-4 h-4 mr-1" />
                        View Location
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Service Quotes & Billing</h3>
            <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate Service Quote</DialogTitle>
                </DialogHeader>
                <QuoteForm onSubmit={(data) => generateQuoteMutation.mutate(data)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-slate-500">
                Quote management interface will display pending quotes, approved quotes, and billing status
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Analytics dashboard showing response times, completion rates, revenue trends, and technician performance
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// New Call Form Component
function NewCallForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    urgencyLevel: 'medium',
    issueDescription: '',
    reportedBy: '',
    contactPhone: '',
    customerName: '',
    siteAddress: '',
    specialInstructions: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="urgency">Urgency Level</Label>
          <Select value={formData.urgencyLevel} onValueChange={(value) => 
            setFormData({ ...formData, urgencyLevel: value })
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input 
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input 
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Customer or company name"
        />
      </div>

      <div>
        <Label htmlFor="siteAddress">Site Address</Label>
        <Input 
          id="siteAddress"
          value={formData.siteAddress}
          onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
          placeholder="Full address where service is needed"
        />
      </div>

      <div>
        <Label htmlFor="issueDescription">Issue Description</Label>
        <Textarea 
          id="issueDescription"
          value={formData.issueDescription}
          onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
          placeholder="Detailed description of the electrical emergency"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="specialInstructions">Special Instructions</Label>
        <Textarea 
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
          placeholder="Access instructions, safety concerns, etc."
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          Create Emergency Call
        </Button>
      </div>
    </form>
  );
}

// Quote Form Component
function QuoteForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    customerId: '',
    quoteName: '',
    description: '',
    laborHours: 0,
    hourlyRate: 125,
    materialsCost: 0,
    emergencyFee: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const subtotal = (formData.laborHours * formData.hourlyRate) + formData.materialsCost + formData.emergencyFee;
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="quoteName">Quote Name</Label>
        <Input 
          id="quoteName"
          value={formData.quoteName}
          onChange={(e) => setFormData({ ...formData, quoteName: e.target.value })}
          placeholder="Emergency electrical repair quote"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of work to be performed"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="laborHours">Labor Hours</Label>
          <Input 
            id="laborHours"
            type="number"
            value={formData.laborHours}
            onChange={(e) => setFormData({ ...formData, laborHours: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
          <Input 
            id="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
            placeholder="125"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="materialsCost">Materials Cost</Label>
          <Input 
            id="materialsCost"
            type="number"
            value={formData.materialsCost}
            onChange={(e) => setFormData({ ...formData, materialsCost: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="emergencyFee">Emergency Fee</Label>
          <Input 
            id="emergencyFee"
            type="number"
            value={formData.emergencyFee}
            onChange={(e) => setFormData({ ...formData, emergencyFee: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8.75%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Generate Quote</Button>
      </div>
    </form>
  );
}