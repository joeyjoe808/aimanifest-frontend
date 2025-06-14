import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Lightbulb, Clock, Code, Target, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  suggestedOptions: {
    id: string;
    title: string;
    description: string;
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedTime: string;
    requiredFeatures: string[];
  }[];
  clarifyingQuestions: string[];
  detectedEntities: {
    type: 'feature' | 'technology' | 'industry' | 'action';
    value: string;
    confidence: number;
  }[];
  refinementSuggestions: string[];
}

interface ImplementationPlan {
  plan: {
    phase: string;
    description: string;
    tasks: string[];
    estimatedTime: string;
  }[];
  technologies: string[];
  architecture: string;
  nextSteps: string[];
}

export default function IntentAnalysisInterface() {
  const [userInput, setUserInput] = useState("");
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [implementationPlan, setImplementationPlan] = useState<ImplementationPlan | null>(null);
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'refinement' | 'planning'>('input');

  const analyzeIntentMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest("POST", "/api/intent/analyze", { userInput: input });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setCurrentStep('analysis');
    },
    onError: (error) => {
      console.error('Intent analysis failed:', error);
    }
  });

  const refineIntentMutation = useMutation({
    mutationFn: async ({ originalInput, userFeedback, selectedOption }: any) => {
      const response = await apiRequest("POST", "/api/intent/refine", {
        originalInput,
        userFeedback,
        selectedOption
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setCurrentStep('refinement');
    }
  });

  const generatePlanMutation = useMutation({
    mutationFn: async ({ selectedOption, userRequirements }: any) => {
      const response = await apiRequest("POST", "/api/intent/generate-plan", {
        selectedOption,
        userRequirements
      });
      return response.json();
    },
    onSuccess: (data) => {
      setImplementationPlan(data);
      setCurrentStep('planning');
    }
  });

  const handleAnalyze = () => {
    if (userInput.trim()) {
      analyzeIntentMutation.mutate(userInput);
    }
  };

  const handleSelectOption = (option: any) => {
    setSelectedOption(option);
    generatePlanMutation.mutate({
      selectedOption: option,
      userRequirements: userInput
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Target className="h-4 w-4" />;
      case 'technology': return <Code className="h-4 w-4" />;
      case 'action': return <ArrowRight className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          AI Project Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Describe your project idea and get intelligent suggestions and implementation guidance
        </p>
      </div>

      {/* Step 1: User Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Describe Your Project
          </CardTitle>
          <CardDescription>
            Tell us what you want to build. Be as detailed or as vague as you like - our AI will help clarify your vision.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="I want to build a web application for managing tasks, or maybe an e-commerce site, or something with real-time chat..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={!userInput.trim() || analyzeIntentMutation.isPending}
            className="w-full"
          >
            {analyzeIntentMutation.isPending ? "Analyzing..." : "Analyze Project Intent"}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Intent Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Intent Analysis
            </CardTitle>
            <CardDescription>
              Based on your description, here's what we understand and suggest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Intent */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Primary Intent</h3>
              <p className="text-gray-700 dark:text-gray-300">{analysis.primaryIntent}</p>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Confidence:</span>
                  <Progress value={analysis.confidence * 100} className="w-24" />
                  <span>{Math.round(analysis.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Detected Entities */}
            {analysis.detectedEntities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Detected Elements</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedEntities.map((entity, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {getEntityTypeIcon(entity.type)}
                      {entity.value}
                      <span className="text-xs opacity-70">({Math.round(entity.confidence * 100)}%)</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Options */}
            <div>
              <h3 className="font-semibold mb-3">Implementation Options</h3>
              <div className="grid gap-4">
                {analysis.suggestedOptions.map((option) => (
                  <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">{option.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getComplexityColor(option.complexity)}>
                            {option.complexity}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {option.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {option.description}
                      </p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Required Features:</h5>
                        <div className="flex flex-wrap gap-1">
                          {option.requiredFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSelectOption(option)}
                        className="w-full mt-4"
                        disabled={generatePlanMutation.isPending}
                      >
                        {generatePlanMutation.isPending ? "Generating Plan..." : "Choose This Option"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Clarifying Questions */}
            {analysis.clarifyingQuestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Questions to Consider
                </h3>
                <ul className="space-y-2">
                  {analysis.clarifyingQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-blue-500 mt-1">•</span>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Refinement Suggestions */}
            {analysis.refinementSuggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Suggestions for Better Results</h3>
                <ul className="space-y-2">
                  {analysis.refinementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Implementation Plan */}
      {implementationPlan && selectedOption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Implementation Plan: {selectedOption.title}
            </CardTitle>
            <CardDescription>
              Detailed roadmap for building your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technologies */}
            <div>
              <h3 className="font-semibold mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {implementationPlan.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Architecture */}
            <div>
              <h3 className="font-semibold mb-3">Architecture Overview</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {implementationPlan.architecture}
              </p>
            </div>

            {/* Implementation Phases */}
            <div>
              <h3 className="font-semibold mb-3">Development Phases</h3>
              <div className="space-y-4">
                {implementationPlan.plan.map((phase, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{phase.phase}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {phase.estimatedTime}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {phase.description}
                    </p>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Tasks:</h5>
                      <ul className="space-y-1">
                        {phase.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-blue-500 mt-1">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="font-semibold mb-3">Immediate Next Steps</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <ul className="space-y-2">
                  {implementationPlan.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />
            
            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setAnalysis(null);
                  setSelectedOption(null);
                  setImplementationPlan(null);
                  setCurrentStep('input');
                  setUserInput("");
                }}
                variant="outline"
                className="flex-1"
              >
                Start New Project
              </Button>
              <Button className="flex-1">
                Begin Implementation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}