import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Shield, Zap, Calendar, Trophy, BarChart3, History } from 'lucide-react';

// Expanded mock NFL data
const mockNFLData = {
  teams: [
    {
      id: 1,
      name: 'Kansas City Chiefs',
      abbreviation: 'KC',
      logo: '🏆',
      conference: 'AFC',
      division: 'West',
      offense_stats: {
        passing_yards: 285.4,
        rushing_yards: 118.2,
        points_per_game: 28.5,
        red_zone_efficiency: 0.68,
        third_down_conversion: 0.45,
        total_yards: 403.6
      },
      defense_stats: {
        points_allowed: 19.8,
        yards_allowed: 310.5,
        turnovers_forced: 18,
        sacks: 45,
        third_down_defense: 0.35,
        interceptions: 12
      },
      special_teams_stats: {
        fg_percentage: 0.88,
        punt_return_avg: 8.2,
        kick_return_avg: 22.1,
        net_punting: 41.5,
        blocked_kicks: 3
      }
    },
    {
      id: 2,
      name: 'Buffalo Bills',
      abbreviation: 'BUF',
      logo: '🦌',
      conference: 'AFC',
      division: 'East',
      offense_stats: {
        passing_yards: 268.7,
        rushing_yards: 105.3,
        points_per_game: 26.2,
        red_zone_efficiency: 0.62,
        third_down_conversion: 0.42,
        total_yards: 374.0
      },
      defense_stats: {
        points_allowed: 21.5,
        yards_allowed: 295.8,
        turnovers_forced: 22,
        sacks: 38,
        third_down_defense: 0.38,
        interceptions: 15
      },
      special_teams_stats: {
        fg_percentage: 0.85,
        punt_return_avg: 7.8,
        kick_return_avg: 21.5,
        net_punting: 43.2,
        blocked_kicks: 2
      }
    },
    {
      id: 3,
      name: 'San Francisco 49ers',
      abbreviation: 'SF',
      logo: '⚡',
      conference: 'NFC',
      division: 'West',
      offense_stats: {
        passing_yards: 245.8,
        rushing_yards: 142.3,
        points_per_game: 25.8,
        red_zone_efficiency: 0.65,
        third_down_conversion: 0.48,
        total_yards: 388.1
      },
      defense_stats: {
        points_allowed: 18.9,
        yards_allowed: 285.2,
        turnovers_forced: 25,
        sacks: 52,
        third_down_defense: 0.32,
        interceptions: 18
      },
      special_teams_stats: {
        fg_percentage: 0.91,
        punt_return_avg: 9.1,
        kick_return_avg: 23.4,
        net_punting: 44.8,
        blocked_kicks: 4
      }
    },
    {
      id: 4,
      name: 'Philadelphia Eagles',
      abbreviation: 'PHI',
      logo: '🦅',
      conference: 'NFC',
      division: 'East',
      offense_stats: {
        passing_yards: 255.2,
        rushing_yards: 128.7,
        points_per_game: 27.1,
        red_zone_efficiency: 0.71,
        third_down_conversion: 0.44,
        total_yards: 383.9
      },
      defense_stats: {
        points_allowed: 20.3,
        yards_allowed: 302.1,
        turnovers_forced: 20,
        sacks: 41,
        third_down_defense: 0.36,
        interceptions: 13
      },
      special_teams_stats: {
        fg_percentage: 0.87,
        punt_return_avg: 8.5,
        kick_return_avg: 22.8,
        net_punting: 42.1,
        blocked_kicks: 1
      }
    }
  ],
  games: [
    {
      id: 1,
      home_team: 'Kansas City Chiefs',
      away_team: 'Buffalo Bills',
      date: '2025-01-15',
      week: 'Wild Card',
      status: 'upcoming'
    },
    {
      id: 2,
      home_team: 'San Francisco 49ers',
      away_team: 'Philadelphia Eagles',
      date: '2025-01-16',
      week: 'Wild Card',
      status: 'upcoming'
    },
    {
      id: 3,
      home_team: 'Kansas City Chiefs',
      away_team: 'San Francisco 49ers',
      date: '2025-01-20',
      week: 'Championship',
      status: 'upcoming'
    }
  ],
  predictions: []
};

const NFLPredictionApp = () => {
  const [offenseWeight, setOffenseWeight] = useState([40]);
  const [defenseWeight, setDefenseWeight] = useState([35]);
  const [specialTeamsWeight, setSpecialTeamsWeight] = useState([25]);
  const [selectedGame, setSelectedGame] = useState(0);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('predict');

  // Ensure weights always total 100%
  const adjustWeights = (category, newValue) => {
    const value = newValue[0];
    const total = offenseWeight[0] + defenseWeight[0] + specialTeamsWeight[0];
    const remaining = 100 - value;
    
    if (category === 'offense') {
      setOffenseWeight([value]);
      const defenseRatio = defenseWeight[0] / (total - offenseWeight[0]);
      const specialRatio = specialTeamsWeight[0] / (total - offenseWeight[0]);
      setDefenseWeight([Math.round(remaining * defenseRatio)]);
      setSpecialTeamsWeight([Math.round(remaining * specialRatio)]);
    } else if (category === 'defense') {
      setDefenseWeight([value]);
      const offenseRatio = offenseWeight[0] / (total - defenseWeight[0]);
      const specialRatio = specialTeamsWeight[0] / (total - defenseWeight[0]);
      setOffenseWeight([Math.round(remaining * offenseRatio)]);
      setSpecialTeamsWeight([Math.round(remaining * specialRatio)]);
    } else if (category === 'special') {
      setSpecialTeamsWeight([value]);
      const offenseRatio = offenseWeight[0] / (total - specialTeamsWeight[0]);
      const defenseRatio = defenseWeight[0] / (total - specialTeamsWeight[0]);
      setOffenseWeight([Math.round(remaining * offenseRatio)]);
      setDefenseWeight([Math.round(remaining * defenseRatio)]);
    }
  };

  // Calculate team score based on weighted categories
  const calculateTeamScore = (team) => {
    const offenseScore = (
      (team.offense_stats.passing_yards / 300) * 0.25 +
      (team.offense_stats.rushing_yards / 150) * 0.25 +
      (team.offense_stats.points_per_game / 35) * 0.3 +
      team.offense_stats.red_zone_efficiency * 0.1 +
      team.offense_stats.third_down_conversion * 0.1
    ) * 100;

    const defenseScore = (
      (1 - team.defense_stats.points_allowed / 35) * 0.25 +
      (1 - team.defense_stats.yards_allowed / 400) * 0.2 +
      (team.defense_stats.turnovers_forced / 25) * 0.2 +
      (team.defense_stats.sacks / 50) * 0.2 +
      (1 - team.defense_stats.third_down_defense) * 0.15
    ) * 100;

    const specialScore = (
      team.special_teams_stats.fg_percentage * 0.4 +
      (team.special_teams_stats.punt_return_avg / 12) * 0.15 +
      (team.special_teams_stats.kick_return_avg / 25) * 0.15 +
      (team.special_teams_stats.net_punting / 50) * 0.15 +
      (team.special_teams_stats.blocked_kicks / 5) * 0.15
    ) * 100;

    const weightedScore = 
      (offenseScore * offenseWeight[0] / 100) +
      (defenseScore * defenseWeight[0] / 100) +
      (specialScore * specialTeamsWeight[0] / 100);

    return Math.round(weightedScore * 100) / 100;
  };

  // Generate prediction
  const generatePrediction = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const game = mockNFLData.games[selectedGame];
      const homeTeam = mockNFLData.teams.find(t => t.name === game.home_team);
      const awayTeam = mockNFLData.teams.find(t => t.name === game.away_team);
      
      const homeScore = calculateTeamScore(homeTeam);
      const awayScore = calculateTeamScore(awayTeam);
      
      const winner = homeScore > awayScore ? homeTeam : awayTeam;
      const scoreDiff = Math.abs(homeScore - awayScore);
      const confidence = Math.min(scoreDiff * 1.5 + 50, 95);
      
      const newPrediction = {
        id: Date.now(),
        game: game,
        winner: winner.name,
        winnerLogo: winner.logo,
        confidence: confidence,
        homeScore,
        awayScore,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        weights: {
          offense: offenseWeight[0],
          defense: defenseWeight[0],
          special: specialTeamsWeight[0]
        },
        timestamp: new Date().toISOString()
      };
      
      setPredictions(prev => [newPrediction, ...prev]);
      setIsLoading(false);
    }, 1000);
  };

  // Get current prediction
  const currentPrediction = predictions.length > 0 ? predictions[0] : null;

  // Validate that weights total 100%
  const totalWeight = offenseWeight[0] + defenseWeight[0] + specialTeamsWeight[0];
  const isValidWeight = totalWeight === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">NFL Game Predictor</h1>
          <p className="text-lg text-gray-600">Advanced analytics for smarter predictions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Predict
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="space-y-6">
            {/* Game Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {mockNFLData.games.map((game, index) => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGame(index)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedGame === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">
                            {game.away_team} @ {game.home_team}
                          </div>
                          <div className="text-sm text-gray-600">
                            {game.week} • {game.date}
                          </div>
                        </div>
                        <div className="text-2xl">
                          {mockNFLData.teams.find(t => t.name === game.away_team)?.logo}
                          {" vs "}
                          {mockNFLData.teams.find(t => t.name === game.home_team)?.logo}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weight Validation Alert */}
            {!isValidWeight && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  Total weight: {totalWeight}% (must equal 100%)
                </span>
              </div>
            )}

            {/* Category Weight Controls */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-xl">Offense</CardTitle>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{offenseWeight[0]}%</span>
                  </div>
                  <CardDescription>
                    Passing, rushing, scoring efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={offenseWeight}
                    onValueChange={(value) => adjustWeights('offense', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-xl">Defense</CardTitle>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{defenseWeight[0]}%</span>
                  </div>
                  <CardDescription>
                    Points allowed, turnovers, pressure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={defenseWeight}
                    onValueChange={(value) => adjustWeights('defense', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-6 w-6 text-purple-600" />
                      <CardTitle className="text-xl">Special Teams</CardTitle>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{specialTeamsWeight[0]}%</span>
                  </div>
                  <CardDescription>
                    Field goals, returns, punting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Slider
                    value={specialTeamsWeight}
                    onValueChange={(value) => adjustWeights('special', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prediction Button */}
            <div className="text-center">
              <Button 
                onClick={generatePrediction}
                disabled={!isValidWeight || isLoading}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Calculating...' : 'Generate Prediction'}
              </Button>
            </div>

            {/* Prediction Results */}
            {currentPrediction && (
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    Latest Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-lg text-gray-600 mb-2">
                      {currentPrediction.game.week} • {currentPrediction.game.date}
                    </div>
                    <div className="text-xl text-gray-700 mb-4">
                      {currentPrediction.awayTeam} @ {currentPrediction.homeTeam}
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                      {currentPrediction.winnerLogo} {currentPrediction.winner}
                    </div>
                    <div className="text-lg text-gray-700">
                      Confidence: {currentPrediction.confidence.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{currentPrediction.homeTeam}</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {currentPrediction.homeScore}
                      </div>
                      <div className="text-sm text-gray-600">Weighted Score</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{currentPrediction.awayTeam}</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {currentPrediction.awayScore}
                      </div>
                      <div className="text-sm text-gray-600">Weighted Score</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Your Weighting</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Offense: {currentPrediction.weights.offense}%</div>
                      <div>Defense: {currentPrediction.weights.defense}%</div>
                      <div>Special Teams: {currentPrediction.weights.special}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Comparison</CardTitle>
                <CardDescription>Compare key stats across all teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Team</th>
                        <th className="text-right p-2">Off PPG</th>
                        <th className="text-right p-2">Def PA</th>
                        <th className="text-right p-2">TO Diff</th>
                        <th className="text-right p-2">FG%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockNFLData.teams.map(team => (
                        <tr key={team.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{team.logo} {team.name}</td>
                          <td className="text-right p-2">{team.offense_stats.points_per_game}</td>
                          <td className="text-right p-2">{team.defense_stats.points_allowed}</td>
                          <td className="text-right p-2">
                            +{team.defense_stats.turnovers_forced}
                          </td>
                          <td className="text-right p-2">
                            {(team.special_teams_stats.fg_percentage * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Games</CardTitle>
                <CardDescription>Playoff schedule and key matchups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNFLData.games.map(game => (
                    <div key={game.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">
                            {game.away_team} @ {game.home_team}
                          </div>
                          <div className="text-sm text-gray-600">
                            {game.week} • {game.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-2">
                            {mockNFLData.teams.find(t => t.name === game.away_team)?.logo}
                            {" vs "}
                            {mockNFLData.teams.find(t => t.name === game.home_team)?.logo}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedGame(mockNFLData.games.indexOf(game));
                              setActiveTab('predict');
                            }}
                          >
                            Predict
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>Your past predictions and results</CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No predictions yet. Make your first prediction to see history here!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {predictions.map(prediction => (
                      <div key={prediction.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">
                            {prediction.game.away_team} @ {prediction.game.home_team}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(prediction.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-green-600 font-medium">
                            {prediction.winnerLogo} {prediction.winner}
                          </div>
                          <div className="text-sm text-gray-600">
                            {prediction.confidence.toFixed(1)}% confidence
                          </div>
                          <div className="text-xs text-gray-500">
                            O:{prediction.weights.offense}% D:{prediction.weights.defense}% ST:{prediction.weights.special}%
                          </div>
                        </div>
                      </div>
                    ))}
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

export default NFLPredictionApp;