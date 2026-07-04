import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, BarChart3, Calendar, History, Star, Lock, 
  TrendingUp, Shield, Zap, Crown, Gift, CheckCircle,
  ArrowRight, Users, Target, Award, Sparkles
} from 'lucide-react';

const FreeMembersPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock user data
  const userStats = {
    name: "Mike Johnson",
    memberSince: "January 2025",
    totalPredictions: 12,
    accuracy: 67,
    streak: 3,
    rank: "Bronze Predictor"
  };

  // Free tier limitations
  const freeLimitations = {
    predictionsPerWeek: 3,
    predictionsUsed: 2,
    historyDays: 30,
    teams: 4, // Limited teams
    features: ['Basic Predictions', 'Team Stats', 'Game Schedule']
  };

  // Premium features preview
  const premiumFeatures = [
    {
      icon: <Crown className="h-5 w-5 text-yellow-600" />,
      title: "Unlimited Predictions",
      description: "Make predictions on every game, every week",
      current: `${freeLimitations.predictionsUsed}/${freeLimitations.predictionsPerWeek} per week`
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      title: "Advanced Analytics",
      description: "Deep dive into player stats, injuries, weather data",
      current: "Basic team stats only"
    },
    {
      icon: <History className="h-5 w-5 text-purple-600" />,
      title: "Full Season History",
      description: "Access all your predictions and track long-term performance",
      current: "Last 30 days only"
    },
    {
      icon: <Target className="h-5 w-5 text-green-600" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations and trend analysis",
      current: "Manual analysis only"
    },
    {
      icon: <Users className="h-5 w-5 text-red-600" />,
      title: "All 32 Teams",
      description: "Full NFL coverage with detailed stats for every team",
      current: "4 teams only"
    },
    {
      icon: <Award className="h-5 w-5 text-indigo-600" />,
      title: "Leaderboards & Contests",
      description: "Compete with other predictors and win prizes",
      current: "View only"
    }
  ];

  // Recent predictions (limited for free users)
  const recentPredictions = [
    {
      id: 1,
      matchup: "Chiefs vs Bills",
      prediction: "Chiefs",
      confidence: 73,
      result: "correct",
      date: "2025-01-15"
    },
    {
      id: 2,
      matchup: "49ers vs Eagles", 
      prediction: "49ers",
      confidence: 68,
      result: "correct",
      date: "2025-01-16"
    },
    {
      id: 3,
      matchup: "Cowboys vs Packers",
      prediction: "Cowboys",
      confidence: 55,
      result: "incorrect",
      date: "2025-01-14"
    }
  ];

  const handleUpgrade = () => {
    // Navigate to paid page (we'll build this next)
    alert("Redirecting to Premium upgrade...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Welcome back, {userStats.name}!</h1>
            <p className="text-lg text-gray-600 mt-1">Free Member • {userStats.memberSince}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Gift className="h-4 w-4 mr-1" />
              Free Plan
            </Badge>
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              My Predictions
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade
            </TabsTrigger>
            <TabsTrigger value="predictor" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Make Prediction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Predictions</p>
                      <p className="text-2xl font-bold text-blue-600">{userStats.totalPredictions}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{userStats.accuracy}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-2xl font-bold text-purple-600">{userStats.streak}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rank</p>
                      <p className="text-lg font-bold text-orange-600">{userStats.rank}</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Limits */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Usage This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Predictions Used</span>
                      <span className="text-sm text-gray-600">
                        {freeLimitations.predictionsUsed}/{freeLimitations.predictionsPerWeek}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(freeLimitations.predictionsUsed / freeLimitations.predictionsPerWeek) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Resets in: <strong>5 days</strong></span>
                    <Button variant="outline" size="sm" onClick={handleUpgrade}>
                      Get Unlimited <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Your last 3 predictions (Premium users see full history)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPredictions.map(prediction => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{prediction.matchup}</div>
                        <div className="text-sm text-gray-600">Picked: {prediction.prediction}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">{prediction.confidence}%</div>
                        <Badge variant={prediction.result === 'correct' ? 'default' : 'destructive'}>
                          {prediction.result === 'correct' ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Older predictions locked. Upgrade to see full history.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {/* Predictions limit reached */}
            {freeLimitations.predictionsUsed >= freeLimitations.predictionsPerWeek ? (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Weekly Limit Reached</h3>
                    <p className="text-red-600 mb-4">
                      You've used all {freeLimitations.predictionsPerWeek} predictions this week. 
                      Upgrade to Premium for unlimited predictions!
                    </p>
                    <Button onClick={handleUpgrade} className="bg-red-600 hover:bg-red-700">
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Make a Prediction
                    <Badge variant="secondary">
                      {freeLimitations.predictionsPerWeek - freeLimitations.predictionsUsed} remaining
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Predict?</h3>
                    <p className="text-gray-600 mb-4">Use the NFL Game Predictor to make your next prediction</p>
                    <Button 
                      onClick={() => setActiveTab('predictor')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Open Predictor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prediction History */}
            <Card>
              <CardHeader>
                <CardTitle>Your Prediction History</CardTitle>
                <CardDescription>Last 30 days • Premium users get full season history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPredictions.map(prediction => (
                    <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{prediction.matchup}</div>
                        <div className="text-sm text-gray-600">{prediction.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{prediction.prediction}</div>
                          <div className="text-sm text-gray-600">{prediction.confidence}% confidence</div>
                        </div>
                        <Badge variant={prediction.result === 'correct' ? 'default' : 'destructive'}>
                          {prediction.result === 'correct' ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-6">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription className="text-lg">
                  Unlock the full power of NFL predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <p className="text-xs text-red-600">
                          Currently: {feature.current}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 text-lg"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to Premium - $9.99/month
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Cancel anytime • 30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NFL Game Predictor</CardTitle>
                <CardDescription>
                  {freeLimitations.predictionsUsed < freeLimitations.predictionsPerWeek 
                    ? `Make your prediction (${freeLimitations.predictionsPerWeek - freeLimitations.predictionsUsed} remaining this week)`
                    : "Weekly limit reached - upgrade for unlimited predictions"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {freeLimitations.predictionsUsed >= freeLimitations.predictionsPerWeek ? (
                  <div className="text-center py-8">
                    <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Prediction Limit Reached</h3>
                    <p className="text-gray-600 mb-4">
                      You've used all your free predictions this week. Upgrade to Premium for unlimited access!
                    </p>
                    <Button onClick={handleUpgrade} className="bg-yellow-600 hover:bg-yellow-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Make a Prediction?</h3>
                    <p className="text-gray-600 mb-4">
                      Access the full NFL Game Predictor to analyze matchups and make your pick
                    </p>
                    <Button 
                      onClick={() => alert("Opening NFL Game Predictor...")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Open Predictor Tool
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FreeMembersPage;