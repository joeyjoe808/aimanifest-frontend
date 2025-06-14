import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UserProgress {
  userId: string;
  level: number;
  totalXP: number;
  completedModules: string[];
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  skills: Record<string, number>;
  lastActiveDate: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites: string[];
  skills: string[];
  xpReward: number;
  badgeReward?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'project' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeLimit: number;
  expiresAt: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  rank: number;
}

export default function LearningDashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/learning/user-progress"],
    retry: false,
  });

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ["/api/learning/paths"],
    retry: false,
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/learning/achievements"],
    retry: false,
  });

  const { data: dailyChallenge, isLoading: challengeLoading } = useQuery({
    queryKey: ["/api/learning/daily-challenge"],
    retry: false,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/learning/leaderboard"],
    retry: false,
  });

  const { data: learningTips } = useQuery({
    queryKey: ["/api/learning/learning-tips"],
    retry: false,
  });

  const startModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await apiRequest("POST", "/api/learning/start-module", { moduleId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/user-progress"] });
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async ({ moduleId, timeSpent, score }: { moduleId: string; timeSpent: number; score: number }) => {
      const response = await apiRequest("POST", "/api/learning/complete-module", { 
        moduleId, 
        timeSpent, 
        score 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/achievements"] });
    },
  });

  const calculateXPForNextLevel = (currentLevel: number): number => {
    return Math.pow(currentLevel, 2) * 100;
  };

  const getXPProgress = (): number => {
    if (!userProgress) return 0;
    const currentLevelXP = Math.pow(userProgress.level - 1, 2) * 100;
    const nextLevelXP = calculateXPForNextLevel(userProgress.level);
    const progressXP = userProgress.totalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return Math.min((progressXP / neededXP) * 100, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isModuleUnlocked = (module: LearningModule): boolean => {
    if (!userProgress) return false;
    return module.prerequisites.every(prereq => 
      userProgress.completedModules.includes(prereq)
    );
  };

  const isModuleCompleted = (moduleId: string): boolean => {
    return userProgress?.completedModules.includes(moduleId) || false;
  };

  if (progressLoading || pathsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Learning Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress, complete challenges, and master new skills
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{userProgress?.level || 1}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Progress value={getXPProgress()} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {userProgress?.totalXP || 0} / {calculateXPForNextLevel(userProgress?.level || 1)} XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{userProgress?.currentStreak || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Longest: {userProgress?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{userProgress?.completedModules.length || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modules Completed</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress value={(userProgress?.weeklyProgress || 0) / (userProgress?.weeklyGoal || 3) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {userProgress?.weeklyProgress || 0} / {userProgress?.weeklyGoal || 3} this week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{userProgress?.badges.length || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="learning-path" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="daily-challenge">Daily Challenge</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        {/* Learning Path Tab */}
        <TabsContent value="learning-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Learning Path
              </CardTitle>
              <CardDescription>
                Complete modules in order to unlock new skills and earn XP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {learningPaths && Array.isArray(learningPaths) ? learningPaths.map((module: LearningModule) => (
                  <Card 
                    key={module.id} 
                    className={`transition-all ${
                      !isModuleUnlocked(module) ? 'opacity-50' : 
                      isModuleCompleted(module.id) ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      'hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            {isModuleCompleted(module.id) ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : !isModuleUnlocked(module) ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : null}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {module.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getDifficultyColor(module.difficulty)}>
                              {module.difficulty}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.estimatedTime}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {module.xpReward} XP
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Skills: </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {module.skills.join(', ')}
                              </span>
                            </div>
                            
                            {module.prerequisites.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Prerequisites: </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {module.prerequisites.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {isModuleCompleted(module.id) ? (
                            <Button variant="outline" disabled>
                              Completed
                            </Button>
                          ) : isModuleUnlocked(module) ? (
                            <Button 
                              onClick={() => startModuleMutation.mutate(module.id)}
                              disabled={startModuleMutation.isPending}
                              className="flex items-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Start Module
                            </Button>
                          ) : (
                            <Button variant="outline" disabled>
                              Locked
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <p className="text-center text-gray-500 py-8">
                    No learning modules available. Check back later!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Challenge Tab */}
        <TabsContent value="daily-challenge">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Challenge
              </CardTitle>
              <CardDescription>
                Complete today's challenge to earn bonus XP and maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyChallenge ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{dailyChallenge.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(dailyChallenge.difficulty)}>
                        {dailyChallenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {dailyChallenge.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {dailyChallenge.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {dailyChallenge.timeLimit} minutes
                    </span>
                    <span>
                      Type: {dailyChallenge.type}
                    </span>
                    <span>
                      Expires: {new Date(dailyChallenge.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button className="w-full">
                    Start Challenge
                  </Button>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No daily challenge available today. Check back tomorrow!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>
                Unlock badges and rewards as you progress through your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements && Array.isArray(achievements) ? achievements.map((achievement: Achievement) => {
                  const isEarned = userProgress?.badges.includes(achievement.id);
                  return (
                    <Card 
                      key={achievement.id}
                      className={`transition-all ${
                        isEarned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                        'opacity-75'
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h3 className="font-semibold mb-2">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {achievement.description}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <Badge variant="outline">
                            {achievement.xpReward} XP
                          </Badge>
                        </div>
                        {isEarned && (
                          <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Earned!
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <p className="col-span-full text-center text-gray-500 py-8">
                    No achievements available yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                See how you rank against other learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {leaderboard && Array.isArray(leaderboard) ? leaderboard.map((entry: LeaderboardEntry, index: number) => (
                    <div 
                      key={entry.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-medium">{entry.username}</p>
                          <p className="text-sm text-gray-500">Level {entry.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.totalXP} XP</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {entry.currentStreak}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-500 py-8">
                      Leaderboard not available yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Tips
              </CardTitle>
              <CardDescription>
                Personalized advice to accelerate your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningTips && Array.isArray(learningTips) ? learningTips.map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">{tip}</p>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-8">
                    No tips available right now.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}