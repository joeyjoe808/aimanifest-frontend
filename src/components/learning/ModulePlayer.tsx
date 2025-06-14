import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  Code, 
  BookOpen, 
  Award,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ModuleContent {
  theory: string;
  practicalExercise: string;
  codeExample?: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  skills: string[];
  content: ModuleContent;
  xpReward: number;
  badgeReward?: string;
}

interface ModulePlayerProps {
  module: LearningModule;
  onComplete: (score: number, timeSpent: number) => void;
  onExit: () => void;
}

export default function ModulePlayer({ module, onComplete, onExit }: ModulePlayerProps) {
  const [currentStep, setCurrentStep] = useState<'theory' | 'practice' | 'quiz' | 'completed'>('theory');
  const [startTime] = useState(Date.now());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [practiceCode, setPracticeCode] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const queryClient = useQueryClient();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  const completeModuleMutation = useMutation({
    mutationFn: async ({ moduleId, timeSpent, score }: { moduleId: string; timeSpent: number; score: number }) => {
      const response = await apiRequest("POST", "/api/learning/complete-module", { 
        moduleId, 
        timeSpent, 
        score 
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/achievements"] });
      onComplete(calculateQuizScore(), Math.floor(elapsedTime / 1000 / 60));
    },
  });

  const calculateQuizScore = (): number => {
    const correctAnswers = module.content.quiz.reduce((acc, question, index) => {
      return quizAnswers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
    return Math.round((correctAnswers / module.content.quiz.length) * 100);
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleStepComplete = () => {
    switch (currentStep) {
      case 'theory':
        setCurrentStep('practice');
        break;
      case 'practice':
        setCurrentStep('quiz');
        break;
      case 'quiz':
        setCurrentStep('completed');
        setIsTimerRunning(false);
        const score = calculateQuizScore();
        const timeSpent = Math.floor(elapsedTime / 1000 / 60);
        completeModuleMutation.mutate({
          moduleId: module.id,
          timeSpent,
          score
        });
        break;
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'theory':
        return true;
      case 'practice':
        return practiceCode.trim().length > 20; // Basic validation
      case 'quiz':
        return Object.keys(quizAnswers).length === module.content.quiz.length;
      default:
        return false;
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStepProgress = (): number => {
    switch (currentStep) {
      case 'theory': return 25;
      case 'practice': return 50;
      case 'quiz': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onExit} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Path
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            {formatTime(elapsedTime)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-2"
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              <CardDescription className="text-base">{module.description}</CardDescription>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {module.estimatedTime}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {module.xpReward} XP
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{getStepProgress()}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[
            { key: 'theory', label: 'Theory', icon: BookOpen },
            { key: 'practice', label: 'Practice', icon: Code },
            { key: 'quiz', label: 'Quiz', icon: CheckCircle },
          ].map(({ key, label, icon: Icon }, index) => (
            <div key={key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === key 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : getStepProgress() > (index + 1) * 25 
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm ${
                currentStep === key ? 'text-primary font-medium' : 'text-gray-500'
              }`}>
                {label}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  getStepProgress() > (index + 1) * 25 ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 'theory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">📚 Learning Content</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {module.content.theory}
                  </p>
                </div>
              </div>

              {module.content.codeExample && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">💻 Code Example</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{module.content.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={handleStepComplete} className="w-full">
                  Continue to Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'practice' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">🛠️ Practical Exercise</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {module.content.practicalExercise}
                </p>
              </div>

              <div>
                <Label htmlFor="practice-code" className="text-base font-medium">
                  Your Solution:
                </Label>
                <Textarea
                  id="practice-code"
                  placeholder="Write your code here..."
                  value={practiceCode}
                  onChange={(e) => setPracticeCode(e.target.value)}
                  className="mt-2 min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 20 characters required to proceed
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleStepComplete} 
                  disabled={!canProceed()}
                  className="w-full"
                >
                  Continue to Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'quiz' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">🧠 Knowledge Check</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Answer all questions to complete the module and earn your XP!
                </p>
              </div>

              <div className="space-y-6">
                {module.content.quiz.map((question, questionIndex) => (
                  <Card key={questionIndex} className="border-2">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4">
                        Question {questionIndex + 1}: {question.question}
                      </h4>
                      
                      <RadioGroup
                        value={quizAnswers[questionIndex]?.toString() || ""}
                        onValueChange={(value) => handleQuizAnswer(questionIndex, parseInt(value))}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={optionIndex.toString()} 
                              id={`q${questionIndex}-${optionIndex}`} 
                            />
                            <Label 
                              htmlFor={`q${questionIndex}-${optionIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleStepComplete} 
                  disabled={!canProceed() || completeModuleMutation.isPending}
                  className="w-full"
                >
                  {completeModuleMutation.isPending ? 'Completing...' : 'Complete Module'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'completed' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Module Completed! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Congratulations on completing "{module.title}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateQuizScore()}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Score</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    +{module.xpReward}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">XP Earned</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
                </div>
              </div>

              {module.badgeReward && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Badge Earned: {module.badgeReward}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={onExit}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Module
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}