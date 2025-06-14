import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Home from "@/pages/Home";
import IDE from "@/pages/ide";
import NotFound from "@/pages/not-found";
import BlobDemo from "@/pages/BlobDemo";
import Learning from "@/pages/Learning";
import Workspace from "@/pages/Workspace";
import Dashboard from "@/pages/Dashboard";
import ButtonDemo from "@/pages/ButtonDemo";
import DevTools from "@/pages/DevTools";
import ManifestDemo from "@/pages/ManifestDemo";
import DemoPanelTest from "@/pages/DemoPanelTest";
import ButtonManifestScanner from "@/pages/ButtonManifestScanner";
import MasterOrchestrator from "@/pages/MasterOrchestrator";
import SmartButtonDemo from "@/pages/SmartButtonDemo";
import ChainedPromptSystem from "@/pages/ChainedPromptSystem";
import AIManifestEngine from "@/pages/AIManifestEngine";
import AIManifestEngineDemo from "@/pages/AIManifestEngineDemo";
import EnhancedAIManifestDemo from "@/pages/EnhancedAIManifestDemo";
import UnifiedManifestDemo from "@/pages/UnifiedManifestDemo";
import EmergencyDashboard from "@/features/electrical-emergency/EmergencyDashboard";
import IntentAnalysisInterface from "@/components/intent/IntentAnalysisInterface";
import LearningDashboard from "@/components/learning/LearningDashboard";
import Enterprise from "@/pages/Enterprise";
import HumanAIDemo from "@/pages/HumanAIDemo";
import WebSocketDemo from "@/pages/websocket-demo";
import WebSocketTest from "@/pages/websocket-test";
import SocketTester from "@/pages/SocketTester";
import BugTestDashboard from "@/pages/bug-test-dashboard";
import GitHubStatus from "@/pages/github-status";
import AuthPage from "@/pages/auth";
import PricingPage from "@/pages/pricing";
import SelfHealDashboard from "@/pages/SelfHealDashboard";
import SubscriptionDashboard from "@/pages/SubscriptionDashboard";
import EcosystemDashboard from "@/pages/EcosystemDashboard";
import DeveloperPortal from "@/pages/DeveloperPortal";
import GovernanceDashboard from "@/pages/GovernanceDashboard";
import FederationDashboard from "@/pages/FederationDashboard";
import MonetizationDashboard from "@/pages/MonetizationDashboard";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/ide" component={IDE} />
      <Route path="/ide/:projectId" component={IDE} />
      <Route path="/project/:id" component={IDE} />
      <Route path="/share/:shareUrl" component={IDE} />
      <Route path="/blob-demo" component={BlobDemo} />
      <Route path="/emergency-management" component={EmergencyDashboard} />
      <Route path="/ai-assistant" component={IntentAnalysisInterface} />
      <Route path="/learning" component={Learning} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/buttons" component={ButtonDemo} />
      <Route path="/dev-tools" component={DevTools} />
      <Route path="/manifest-demo" component={ManifestDemo} />
      <Route path="/demo-panel" component={DemoPanelTest} />
      <Route path="/button-scanner" component={ButtonManifestScanner} />
      <Route path="/master-orchestrator" component={MasterOrchestrator} />
      <Route path="/smart-button-demo" component={SmartButtonDemo} />
      <Route path="/chained-prompt-system" component={ChainedPromptSystem} />
      <Route path="/ai-manifest-engine" component={AIManifestEngine} />
      <Route path="/ai-manifest-demo" component={AIManifestEngineDemo} />
      <Route path="/enhanced-ai-manifest" component={EnhancedAIManifestDemo} />
      <Route path="/unified-manifest" component={UnifiedManifestDemo} />
      <Route path="/enterprise" component={Enterprise} />
        <Route path="/human-ai-demo" component={HumanAIDemo} />
        <Route path="/websocket-demo" component={WebSocketDemo} />
        <Route path="/websocket-test" component={WebSocketTest} />
        <Route path="/socket-tester" component={SocketTester} />
        <Route path="/bug-test" component={BugTestDashboard} />
        <Route path="/github-status" component={GitHubStatus} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/self-heal" component={SelfHealDashboard} />
        <Route path="/subscription" component={SubscriptionDashboard} />
        <Route path="/ecosystem" component={EcosystemDashboard} />
        <Route path="/developer-portal" component={DeveloperPortal} />
        <Route path="/governance" component={GovernanceDashboard} />
        <Route path="/federation" component={FederationDashboard} />
        <Route path="/monetization" component={MonetizationDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Global error handler for unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
