import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageCircle, 
  Lightbulb, 
  Target, 
  Zap, 
  Heart,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface DemoExample {
  id: string;
  title: string;
  userInput: string;
  category: 'misspelling' | 'emotional' | 'topic_shift' | 'incomplete' | 'predictive' | 'scattered' | 'vague' | 'rambling';
  description: string;
  expectedBehavior: string;
}

const demoExamples: DemoExample[] = [
  {
    id: '1',
    title: 'Misspelling Correction',
    userInput: 'Can you hep me buld a websit with reakt?',
    category: 'misspelling',
    description: 'AI corrects spelling while understanding intent',
    expectedBehavior: 'Corrects "hep" to "help", "buld" to "build", "websit" to "website", "reakt" to "React"'
  },
  {
    id: '2',
    title: 'Emotional Support',
    userInput: 'I\'m really frustrated, this code isn\'t working and I don\'t know what to do',
    category: 'emotional',
    description: 'AI provides empathetic response to user frustration',
    expectedBehavior: 'Acknowledges frustration, offers encouragement, provides structured help'
  },
  {
    id: '3',
    title: 'Topic Shift Detection',
    userInput: 'Actually, forget the React app. Can you help me with Python instead?',
    category: 'topic_shift',
    description: 'AI smoothly transitions between different topics',
    expectedBehavior: 'Recognizes topic change, adapts context, maintains conversation flow'
  },
  {
    id: '4',
    title: 'Incomplete Request',
    userInput: 'I want to build something with',
    category: 'incomplete',
    description: 'AI handles incomplete thoughts naturally',
    expectedBehavior: 'Asks clarifying questions, suggests common options, maintains engagement'
  },
  {
    id: '5',
    title: 'Predictive Assistance',
    userInput: 'I need to deploy my app',
    category: 'predictive',
    description: 'AI anticipates next steps and provides suggestions',
    expectedBehavior: 'Suggests deployment platforms, asks about requirements, offers step-by-step guidance'
  },
  {
    id: '6',
    title: 'Scattered Prompt Restructuring',
    userInput: 'so I have this idea and like maybe I want to make a website or app or something and it should do things with users and maybe databases and I\'m not sure about the tech stack but I heard React is good and also Python might work and I need it to be fast and secure and maybe mobile too',
    category: 'scattered',
    description: 'AI restructures rambling thoughts into organized requirements',
    expectedBehavior: 'Organizes scattered ideas into clear project goals, tech requirements, and next steps'
  },
  {
    id: '7',
    title: 'Vague Request Clarification',
    userInput: 'make it better and faster with more features and stuff',
    category: 'vague',
    description: 'AI converts vague requests into specific action items',
    expectedBehavior: 'Transforms vague improvements into concrete performance goals and feature specifications'
  },
  {
    id: '8',
    title: 'Technical Rambling Organization',
    userInput: 'I need authentication but also authorization and maybe JWT tokens or session cookies not sure which is better and also need to handle password reset and email verification plus social login would be cool',
    category: 'rambling',
    description: 'AI organizes complex technical requirements into structured plans',
    expectedBehavior: 'Parses multiple requirements and creates organized implementation roadmap'
  }
];

export default function HumanAIDemo() {
  const [selectedExample, setSelectedExample] = useState<DemoExample | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [restructuredResult, setRestructuredResult] = useState<any>(null);

  const processInput = async (input: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/human-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input, 
          userId: 'demo-user', 
          sessionId: 'demo-session' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error processing input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const restructurePrompt = async (input: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/human-ai/restructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input,
          intentAnalysis: {
            primary: 'development',
            confidence: 0.8,
            emotional_tone: 'neutral',
            urgency: 'medium',
            context: 'project_planning'
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRestructuredResult(data);
      }
    } catch (error) {
      console.error('Error restructuring prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'misspelling': return <CheckCircle className="w-4 h-4" />;
      case 'emotional': return <Heart className="w-4 h-4" />;
      case 'topic_shift': return <Zap className="w-4 h-4" />;
      case 'incomplete': return <AlertCircle className="w-4 h-4" />;
      case 'predictive': return <Lightbulb className="w-4 h-4" />;
      case 'scattered': return <Sparkles className="w-4 h-4" />;
      case 'vague': return <Target className="w-4 h-4" />;
      case 'rambling': return <Brain className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'misspelling': return 'bg-green-100 text-green-800';
      case 'emotional': return 'bg-pink-100 text-pink-800';
      case 'topic_shift': return 'bg-purple-100 text-purple-800';
      case 'incomplete': return 'bg-orange-100 text-orange-800';
      case 'predictive': return 'bg-blue-100 text-blue-800';
      case 'scattered': return 'bg-indigo-100 text-indigo-800';
      case 'vague': return 'bg-yellow-100 text-yellow-800';
      case 'rambling': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Human-Like AI Demo</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience advanced AI that understands natural language patterns, corrects mistakes, 
          detects emotions, and provides human-like interactions with conversation training.
        </p>
      </div>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="examples">Training Examples</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
          <TabsTrigger value="restructure">Prompt Restructuring</TabsTrigger>
          <TabsTrigger value="capabilities">AI Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {demoExamples.map((example) => (
              <Card 
                key={example.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedExample?.id === example.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedExample(example)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <Badge className={`${getCategoryColor(example.category)} flex items-center gap-1`}>
                      {getCategoryIcon(example.category)}
                      {example.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {example.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">User Input:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded italic">
                        "{example.userInput}"
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Expected Behavior:</p>
                      <p className="text-xs text-gray-700">
                        {example.expectedBehavior}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedExample && (
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Live Demo: {selectedExample.title}
                  </CardTitle>
                  <Button 
                    onClick={() => processInput(selectedExample.userInput)}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Test AI Response
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900 mb-2">Input being processed:</p>
                  <p className="text-blue-800 italic">"{selectedExample.userInput}"</p>
                </div>
                
                {result && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Corrected Input:</p>
                      <p className="text-green-800">{result.correctedInput}</p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-medium text-purple-900 mb-2">Intent Analysis:</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Intent:</span> {result.intentAnalysis?.primaryIntent}</p>
                          <p><span className="font-medium">Confidence:</span> {Math.round((result.intentAnalysis?.confidence || 0) * 100)}%</p>
                          <p><span className="font-medium">Tone:</span> {result.intentAnalysis?.emotionalTone}</p>
                          <p><span className="font-medium">Urgency:</span> {result.intentAnalysis?.urgency}</p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-medium text-orange-900 mb-2">Predictive Suggestions:</p>
                        <div className="space-y-2">
                          {result.suggestions?.slice(0, 3).map((suggestion: any, index: number) => (
                            <div key={index} className="text-sm">
                              <Badge variant="outline" className="mr-2">{suggestion.type}</Badge>
                              {suggestion.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {result.humanLikeResponse && (
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-gray-900 mb-2">Human-Like AI Response:</p>
                        <p className="text-gray-800">{result.humanLikeResponse}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Try Your Own Input
              </CardTitle>
              <CardDescription>
                Test the AI with your own natural language input. Try misspellings, incomplete thoughts, 
                or emotional expressions to see how the AI responds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message here... (try misspellings or incomplete thoughts)"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => processInput(customInput)}
                  disabled={isProcessing || !customInput.trim()}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Process
                    </>
                  )}
                </Button>
              </div>
              
              {result && customInput && (
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Your Input:</p>
                    <p className="text-blue-800 italic">"{customInput}"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-medium text-green-900 mb-2">Processed & Corrected:</p>
                    <p className="text-green-800">{result.correctedInput}</p>
                  </div>
                  
                  {result.humanLikeResponse && (
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-gray-900 mb-2">AI Response:</p>
                      <p className="text-gray-800">{result.humanLikeResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restructure" className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Live Prompt Restructuring Demo
            </h3>
            <p className="text-gray-600 mb-6">
              Enter a scattered, unclear, or rambling request to see how our AI organizes it into a structured action plan.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your scattered prompt:
                </label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Type something like: 'I want to build an app and it needs users and maybe a database and I'm not sure about React or Vue and it should be fast and secure...'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <button
                onClick={() => restructurePrompt(customInput)}
                disabled={isProcessing || !customInput.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Restructure Prompt
                  </>
                )}
              </button>
            </div>

            {restructuredResult && (
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Restructured Results
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Original Prompt:</h5>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{restructuredResult.originalPrompt}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Restructured Prompt:</h5>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">{restructuredResult.restructuredPrompt}</p>
                    </div>
                  </div>
                  
                  {restructuredResult.actionPlan && restructuredResult.actionPlan.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Action Plan:</h5>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <ul className="text-sm text-blue-800 space-y-1">
                          {restructuredResult.actionPlan.map((step: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 font-medium">{index + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {restructuredResult.clarifications && restructuredResult.clarifications.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Clarifying Questions:</h5>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {restructuredResult.clarifications.map((question: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Analyzes scattered thoughts and ideas</li>
                  <li>• Identifies core requirements and goals</li>
                  <li>• Organizes information into logical structure</li>
                  <li>• Creates actionable steps and priorities</li>
                  <li>• Suggests clarifying questions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Saves time on project planning</li>
                  <li>• Reduces miscommunication</li>
                  <li>• Ensures nothing is overlooked</li>
                  <li>• Provides clear next steps</li>
                  <li>• Improves team collaboration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Fuzzy Input Handling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Automatic spelling correction</li>
                  <li>• Grammar improvement</li>
                  <li>• Typo detection and fixing</li>
                  <li>• Casual language interpretation</li>
                  <li>• Context-aware corrections</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Intent Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Primary intent detection</li>
                  <li>• Confidence scoring</li>
                  <li>• Emotional tone analysis</li>
                  <li>• Urgency assessment</li>
                  <li>• Context understanding</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Predictive Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Completion suggestions</li>
                  <li>• Improvement recommendations</li>
                  <li>• Alternative approaches</li>
                  <li>• Warning alerts</li>
                  <li>• Priority-based ordering</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Emotional Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Frustration detection</li>
                  <li>• Empathetic responses</li>
                  <li>• Encouraging communication</li>
                  <li>• Support and guidance</li>
                  <li>• Natural conversation flow</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium">Topic Shift Detection</h3>
                  <p className="text-sm text-gray-600">Seamlessly adapts when conversation topics change</p>
                </div>
                <div className="text-center p-4">
                  <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium">Conversation Training</h3>
                  <p className="text-sm text-gray-600">Uses patterns to enhance response quality</p>
                </div>
                <div className="text-center p-4">
                  <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium">Natural Communication</h3>
                  <p className="text-sm text-gray-600">Generates human-like, contextual responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}