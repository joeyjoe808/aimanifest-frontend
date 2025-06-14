import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  Star,
  Zap,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  PlayCircle,
  Lock,
  Flame
} from 'lucide-react';

interface UserProgress {
  currentLevel: number;
  totalXp: number;
  currentPath: string;
  completedModules: number[];
  streak: number;
}

interface LearningModule {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  xpReward: number;
  estimatedTime: number;
  prerequisites: number[];
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface Achievement {
  id: string;
  achievementName: string;
  description: string;
  badgeIcon: string;
  xpAwarded: number;
  unlockedAt: string;
}

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  timeLimit: number;
  isCompleted?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  streak: number;
}

export default function Learning() {
  const [selectedPath, setSelectedPath] = useState('beginner');
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['/api/learning/user-progress'],
    queryFn: () => apiRequest('GET', '/api/learning/user-progress')
  });

  // Fetch learning paths
  const { data: learningPaths } = useQuery({
    queryKey: ['/api/learning/paths'],
    queryFn: () => apiRequest('GET', '/api/learning/paths')
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['/api/learning/achievements'],
    queryFn: () => apiRequest('GET', '/api/learning/achievements')
  });

  // Fetch daily challenge
  const { data: dailyChallenge } = useQuery({
    queryKey: ['/api/learning/daily-challenge'],
    queryFn: () => apiRequest('GET', '/api/learning/daily-challenge')
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['/api/learning/leaderboard'],
    queryFn: () => apiRequest('GET', '/api/learning/leaderboard')
  });

  // Fetch learning tips
  const { data: learningTips } = useQuery({
    queryKey: ['/api/learning/learning-tips'],
    queryFn: () => apiRequest('GET', '/api/learning/learning-tips')
  });

  // Fetch modules for selected path
  const { data: pathModules } = useQuery({
    queryKey: ['/api/learning/path-modules', selectedPath],
    queryFn: () => apiRequest('GET', `/api/learning/path-modules/${selectedPath}`),
    enabled: !!selectedPath
  });

  // Start module mutation
  const startModuleMutation = useMutation({
    mutationFn: (moduleId: number) => 
      apiRequest('POST', '/api/learning/start-module', { moduleId }),
    onSuccess: (data) => {
      toast({
        title: "Module Started!",
        description: `You've begun "${data.module.title}". Good luck!`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/user-progress'] });
    }
  });

  // Complete module mutation
  const completeModuleMutation = useMutation({
    mutationFn: (moduleId: number) => 
      apiRequest('POST', '/api/learning/complete-module', { moduleId }),
    onSuccess: (data) => {
      toast({
        title: "Module Completed!",
        description: `+${data.xpGained} XP earned! ${data.achievementsUnlocked?.length > 0 ? `New achievements unlocked!` : ''}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/achievements'] });
    }
  });

  const progress = userProgress as UserProgress;
  const currentLevelProgress = progress ? (progress.totalXp % 500) / 500 * 100 : 0;
  const nextLevelXp = progress ? 500 - (progress.totalXp % 500) : 500;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return <Zap className="w-4 h-4" />;
      case 'frontend': return <PlayCircle className="w-4 h-4" />;
      case 'backend': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master AI development through interactive tutorials and hands-on challenges
        </p>
      </div>

      {/* Progress Overview */}
      {progress && (
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Level {progress.currentLevel}
                </CardTitle>
                <CardDescription>
                  {progress.totalXp} total XP • {nextLevelXp} XP to next level
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">{progress.streak} day streak</span>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {progress.currentPath} path
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {progress.currentLevel + 1}</span>
                <span>{Math.round(currentLevelProgress)}%</span>
              </div>
              <Progress value={currentLevelProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="learn" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        {/* Learning Tab */}
        <TabsContent value="learn" className="space-y-6">
          {/* Path Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            {learningPaths?.map((path: any) => (
              <Card 
                key={path.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPath === path.name ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedPath(path.name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <span className="text-2xl">{path.badgeIcon}</span>
                  </div>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                    <span className="text-gray-500">{path.estimatedWeeks} weeks</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Path Modules */}
          {pathModules && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {learningPaths?.find((p: any) => p.name === selectedPath)?.title} Modules
              </h2>
              <div className="grid gap-4">
                {pathModules.map((module: LearningModule) => {
                  const isCompleted = progress?.completedModules.includes(module.id);
                  const isLocked = module.prerequisites.some(prereq => 
                    !progress?.completedModules.includes(prereq)
                  );

                  return (
                    <Card 
                      key={module.id}
                      className={`transition-all ${
                        isLocked ? 'opacity-60' : 'hover:shadow-md'
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getCategoryIcon(module.category)}
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              {isCompleted && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              {isLocked && (
                                <Lock className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={getDifficultyColor(module.difficulty)}>
                              {module.difficulty}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {module.xpReward} XP
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {module.estimatedTime}min
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Category: {module.category}
                          </div>
                          <Button
                            disabled={isLocked || startModuleMutation.isPending}
                            onClick={() => {
                              if (isCompleted) {
                                // Review module
                                setSelectedModule(module.id);
                              } else {
                                // Start module
                                startModuleMutation.mutate(module.id);
                              }
                            }}
                            variant={isCompleted ? "outline" : "default"}
                          >
                            {isCompleted ? 'Review' : 'Start Module'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Daily Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {dailyChallenge && (
              <Card className="border-2 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-orange-500" />
                    Daily Challenge
                  </CardTitle>
                  <CardDescription>Complete today's challenge for bonus XP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{dailyChallenge.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{dailyChallenge.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(dailyChallenge.difficulty)}>
                          {dailyChallenge.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {dailyChallenge.timeLimit}min limit
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {dailyChallenge.xpReward} XP reward
                      </div>
                    </div>
                    <Button>
                      Start Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Challenge Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">23min</div>
                    <div className="text-sm text-gray-500">Avg Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1,800</div>
                    <div className="text-sm text-gray-500">Total XP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements?.map((achievement: Achievement) => (
              <Card key={achievement.id} className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{achievement.badgeIcon}</div>
                  <CardTitle className="text-lg">{achievement.achievementName}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {achievement.xpAwarded} XP
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top learners this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((entry: LeaderboardEntry, index: number) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.username === 'You' ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <Avatar>
                        <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-sm text-gray-500">Level {entry.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.xp.toLocaleString()} XP</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {entry.streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {learningTips?.map((tip: any) => (
              <Card key={tip.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  <Badge variant="outline" className="w-fit">{tip.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}