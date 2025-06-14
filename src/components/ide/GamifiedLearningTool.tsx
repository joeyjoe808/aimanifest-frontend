import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Zap,
  Medal,
  Crown,
  Gift,
  Flame,
  TrendingUp,
  BookOpen,
  Code,
  Rocket,
  Users,
  Award,
  Heart,
  Coffee,
  Brain,
  Lightbulb,
  Timer,
  BarChart,
  Calendar,
  Map
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  xpReward: number;
  modules: LearningModule[];
  prerequisites: string[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
  badge?: string;
}

interface LearningModule {
  id: string;
  title: string;
  type: 'tutorial' | 'challenge' | 'project' | 'quiz';
  duration: string;
  xpReward: number;
  completed: boolean;
  locked: boolean;
  description: string;
  skills: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'progress' | 'skill' | 'social' | 'special';
}

interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streak: number;
  completedPaths: number;
  completedModules: number;
  achievements: Achievement[];
  currentPath?: string;
  lastActivity: string;
}

export default function GamifiedLearningTool() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 3,
    xp: 1250,
    xpToNextLevel: 1500,
    totalXp: 2750,
    streak: 7,
    completedPaths: 2,
    completedModules: 15,
    achievements: [],
    currentPath: 'web-fundamentals',
    lastActivity: new Date().toISOString()
  });

  const learningPaths: LearningPath[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with AI Development',
      description: 'Learn the basics of using AI to build applications',
      difficulty: 'beginner',
      estimatedTime: '2 hours',
      xpReward: 500,
      prerequisites: [],
      unlocked: true,
      completed: true,
      progress: 100,
      badge: 'first-steps',
      modules: [
        {
          id: 'intro-ai-dev',
          title: 'Introduction to AI Development',
          type: 'tutorial',
          duration: '15 min',
          xpReward: 50,
          completed: true,
          locked: false,
          description: 'Learn what AI development is and how it works',
          skills: ['AI Basics', 'Development Concepts']
        },
        {
          id: 'first-project',
          title: 'Create Your First Project',
          type: 'project',
          duration: '30 min',
          xpReward: 100,
          completed: true,
          locked: false,
          description: 'Build a simple website using AI assistance',
          skills: ['Project Creation', 'AI Interaction']
        },
        {
          id: 'ai-prompting',
          title: 'Effective AI Prompting',
          type: 'tutorial',
          duration: '20 min',
          xpReward: 75,
          completed: true,
          locked: false,
          description: 'Learn how to communicate effectively with AI',
          skills: ['AI Prompting', 'Communication']
        },
        {
          id: 'basic-quiz',
          title: 'Basic Concepts Quiz',
          type: 'quiz',
          duration: '10 min',
          xpReward: 50,
          completed: true,
          locked: false,
          description: 'Test your understanding of basic concepts',
          skills: ['Knowledge Check']
        }
      ]
    },
    {
      id: 'web-fundamentals',
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, and JavaScript with AI assistance',
      difficulty: 'beginner',
      estimatedTime: '6 hours',
      xpReward: 1200,
      prerequisites: ['getting-started'],
      unlocked: true,
      completed: false,
      progress: 65,
      modules: [
        {
          id: 'html-basics',
          title: 'HTML Structure and Semantics',
          type: 'tutorial',
          duration: '45 min',
          xpReward: 150,
          completed: true,
          locked: false,
          description: 'Learn HTML fundamentals with AI-generated examples',
          skills: ['HTML', 'Web Structure']
        },
        {
          id: 'css-styling',
          title: 'CSS Styling and Layout',
          type: 'tutorial',
          duration: '60 min',
          xpReward: 200,
          completed: true,
          locked: false,
          description: 'Master CSS with AI-powered design suggestions',
          skills: ['CSS', 'Design', 'Layout']
        },
        {
          id: 'javascript-basics',
          title: 'JavaScript Fundamentals',
          type: 'tutorial',
          duration: '90 min',
          xpReward: 250,
          completed: false,
          locked: false,
          description: 'Learn JavaScript programming with AI guidance',
          skills: ['JavaScript', 'Programming Logic']
        },
        {
          id: 'responsive-design',
          title: 'Responsive Design Challenge',
          type: 'challenge',
          duration: '45 min',
          xpReward: 200,
          completed: false,
          locked: false,
          description: 'Build a responsive website that works on all devices',
          skills: ['Responsive Design', 'Mobile-First']
        },
        {
          id: 'web-project',
          title: 'Complete Web Portfolio',
          type: 'project',
          duration: '120 min',
          xpReward: 400,
          completed: false,
          locked: true,
          description: 'Create a full portfolio website showcasing your skills',
          skills: ['Full-Stack', 'Portfolio', 'Deployment']
        }
      ]
    },
    {
      id: 'react-mastery',
      title: 'React Development Mastery',
      description: 'Build modern React applications with AI assistance',
      difficulty: 'intermediate',
      estimatedTime: '8 hours',
      xpReward: 2000,
      prerequisites: ['web-fundamentals'],
      unlocked: false,
      completed: false,
      progress: 0,
      modules: [
        {
          id: 'react-components',
          title: 'Component Architecture',
          type: 'tutorial',
          duration: '60 min',
          xpReward: 300,
          completed: false,
          locked: true,
          description: 'Learn to build reusable React components',
          skills: ['React', 'Components', 'JSX']
        },
        {
          id: 'state-management',
          title: 'State Management Patterns',
          type: 'tutorial',
          duration: '75 min',
          xpReward: 350,
          completed: false,
          locked: true,
          description: 'Master React state and lifecycle methods',
          skills: ['State Management', 'Hooks', 'Context']
        },
        {
          id: 'react-project',
          title: 'Interactive React Application',
          type: 'project',
          duration: '180 min',
          xpReward: 600,
          completed: false,
          locked: true,
          description: 'Build a complete React application with real functionality',
          skills: ['React App', 'API Integration', 'Routing']
        }
      ]
    },
    {
      id: 'fullstack-development',
      title: 'Full-Stack Development',
      description: 'Build complete applications with frontend and backend',
      difficulty: 'advanced',
      estimatedTime: '12 hours',
      xpReward: 3500,
      prerequisites: ['react-mastery'],
      unlocked: false,
      completed: false,
      progress: 0,
      modules: [
        {
          id: 'backend-apis',
          title: 'RESTful API Development',
          type: 'tutorial',
          duration: '90 min',
          xpReward: 400,
          completed: false,
          locked: true,
          description: 'Create robust backend APIs with AI assistance',
          skills: ['Backend', 'APIs', 'Database']
        },
        {
          id: 'database-design',
          title: 'Database Design and Integration',
          type: 'tutorial',
          duration: '75 min',
          xpReward: 350,
          completed: false,
          locked: true,
          description: 'Design and implement database schemas',
          skills: ['Database', 'SQL', 'Data Modeling']
        },
        {
          id: 'fullstack-project',
          title: 'Complete Full-Stack Application',
          type: 'project',
          duration: '300 min',
          xpReward: 1000,
          completed: false,
          locked: true,
          description: 'Build and deploy a production-ready application',
          skills: ['Full-Stack', 'Deployment', 'Production']
        }
      ]
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first learning path',
      icon: '🎯',
      xpReward: 100,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000).toISOString(),
      rarity: 'common',
      category: 'progress'
    },
    {
      id: 'quick-learner',
      title: 'Quick Learner',
      description: 'Complete 5 modules in one day',
      icon: '⚡',
      xpReward: 200,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 432000000).toISOString(),
      rarity: 'rare',
      category: 'skill'
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      xpReward: 300,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
      rarity: 'epic',
      category: 'progress'
    },
    {
      id: 'code-warrior',
      title: 'Code Warrior',
      description: 'Complete 3 coding challenges',
      icon: '⚔️',
      xpReward: 250,
      unlocked: false,
      rarity: 'rare',
      category: 'skill'
    },
    {
      id: 'ai-master',
      title: 'AI Master',
      description: 'Successfully use AI to build 10 different projects',
      icon: '🤖',
      xpReward: 500,
      unlocked: false,
      rarity: 'legendary',
      category: 'special'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return <BookOpen className="h-4 w-4" />;
      case 'challenge': return <Target className="h-4 w-4" />;
      case 'project': return <Rocket className="h-4 w-4" />;
      case 'quiz': return <Brain className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const startModule = (pathId: string, moduleId: string) => {
    console.log(`Starting module ${moduleId} in path ${pathId}`);
    // Here you would typically navigate to the actual learning content
  };

  const calculateLevelProgress = () => {
    return (userProgress.xp / userProgress.xpToNextLevel) * 100;
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Gamified Learning Path</h3>
          <Badge variant="outline" className="text-yellow-600">Level {userProgress.level}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{userProgress.streak} day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{userProgress.totalXp} XP</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Level {userProgress.level} Progress</span>
                      <span className="text-sm text-gray-600">{userProgress.xp}/{userProgress.xpToNextLevel} XP</span>
                    </div>
                    <Progress value={calculateLevelProgress()} className="h-3" />
                    <div className="text-xs text-gray-500 mt-1">
                      {userProgress.xpToNextLevel - userProgress.xp} XP to Level {userProgress.level + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userProgress.completedPaths}</div>
                      <div className="text-sm text-gray-600">Paths Completed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userProgress.completedModules}</div>
                      <div className="text-sm text-gray-600">Modules Completed</div>
                    </div>
                  </div>

                  {userProgress.currentPath && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Continue Learning</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Web Development Fundamentals</span>
                        <Button size="sm" onClick={() => setActiveTab('paths')}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                      <Progress value={65} className="mt-2 h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.filter(a => a.unlocked).slice(-3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.title}</div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">+{achievement.xpReward} XP</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complete 1 module</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Earn 100 XP</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Practice for 30 minutes</span>
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map(path => (
              <Card key={path.id} className={`${!path.unlocked ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {path.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : 
                         path.unlocked ? <PlayCircle className="h-5 w-5 text-blue-500" /> : 
                         <Lock className="h-5 w-5 text-gray-400" />}
                        {path.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                    </div>
                    {path.badge && (
                      <Medal className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`border ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Timer className="h-3 w-3 mr-1" />
                        {path.estimatedTime}
                      </Badge>
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {path.xpReward} XP
                      </Badge>
                    </div>

                    {path.prerequisites.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Prerequisites: </span>
                        <span className="text-gray-600">{path.prerequisites.join(', ')}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Modules:</h5>
                      {path.modules.slice(0, 3).map(module => (
                        <div key={module.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          {getModuleIcon(module.type)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{module.title}</div>
                            <div className="text-xs text-gray-600">{module.duration}</div>
                          </div>
                          {module.completed ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> :
                            module.locked ? 
                            <Lock className="h-4 w-4 text-gray-400" /> :
                            <Button size="sm" variant="outline" onClick={() => startModule(path.id, module.id)}>
                              Start
                            </Button>
                          }
                        </div>
                      ))}
                      {path.modules.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{path.modules.length - 3} more modules
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={!path.unlocked}
                      onClick={() => setSelectedPath(path.id)}
                    >
                      {path.completed ? 'Review Path' : 
                       path.unlocked ? 'Continue Learning' : 
                       'Locked'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <Card key={achievement.id} className={`${getRarityColor(achievement.rarity)} ${!achievement.unlocked ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {achievement.xpReward} XP
                      </Badge>
                      <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                    {!achievement.unlocked && (
                      <Lock className="h-6 w-6 text-gray-400 mx-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{userProgress.level}</div>
                      <div className="text-sm text-gray-600">Current Level</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{userProgress.totalXp}</div>
                      <div className="text-sm text-gray-600">Total XP Earned</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Tutorials Completed</span>
                      <span className="text-sm font-medium">8/12</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Challenges Completed</span>
                      <span className="text-sm font-medium">3/8</span>
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Projects Built</span>
                      <span className="text-sm font-medium">4/6</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">Getting Started</div>
                      <div className="text-xs text-gray-600">Completed • 500 XP earned</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">Web Fundamentals</div>
                      <div className="text-xs text-gray-600">In Progress • 65% complete</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">React Mastery</div>
                      <div className="text-xs text-gray-600">Locked • Complete Web Fundamentals</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">Full-Stack Development</div>
                      <div className="text-xs text-gray-600">Locked • Complete React Mastery</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Learning Tips & Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Coffee className="h-5 w-5 text-yellow-600 mb-2" />
                  <h4 className="font-medium text-sm mb-1">Take Breaks</h4>
                  <p className="text-xs text-gray-600">Regular breaks help consolidate learning and prevent burnout.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600 mb-2" />
                  <h4 className="font-medium text-sm mb-1">Practice Daily</h4>
                  <p className="text-xs text-gray-600">Consistent daily practice is more effective than long sessions.</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mb-2" />
                  <h4 className="font-medium text-sm mb-1">Join Community</h4>
                  <p className="text-xs text-gray-600">Connect with other learners for support and motivation.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}