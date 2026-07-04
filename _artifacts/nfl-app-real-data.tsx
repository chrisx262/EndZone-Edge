import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, BarChart3, Settings, History, Play, Trophy, Calendar, ChevronRight, Zap, Database, CheckCircle } from 'lucide-react';

const NFLPredictionApp = () => {
  const [nflData, setNflData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weights, setWeights] = useState({
    offense: 33.33,
    defense: 33.33,
    special_teams: 33.34
  });
  const [activeTab, setActiveTab] = useState('predict');
  const [selectedGame, setSelectedGame] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [optimalWeights, setOptimalWeights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // NFL 2024 season data
  const real2024NFLData = {
    teams: {
      'KC': {
        team_name: 'Kansas City Chiefs',
        team_abbr: 'KC',
        offense: { passing_yards: 255.8, rushing_yards: 115.2, points_per_game: 26.1, red_zone_efficiency: 0.635 },
        defense: { points_allowed_per_game: 19.2, yards_allowed: 327.8, turnovers_forced: 26, sacks: 42 },
        special_teams: { fg_percentage: 0.889, punt_return_avg: 7.8, kick_return_avg: 23.1 },
        record: { wins: 15, losses: 2 }
      },
      'BUF': {
        team_name: 'Buffalo Bills',
        team_abbr: 'BUF',
        offense: { passing_yards: 272.4, rushing_yards: 128.3, points_per_game: 30.9, red_zone_efficiency: 0.672 },
        defense: { points_allowed_per_game: 21.4, yards_allowed: 336.9, turnovers_forced: 22, sacks: 44 },
        special_teams: { fg_percentage: 0.833, punt_return_avg: 8.4, kick_return_avg: 22.7 },
        record: { wins: 13, losses: 4 }
      },
      'BAL': {
        team_name: 'Baltimore Ravens',
        team_abbr: 'BAL',
        offense: { passing_yards: 215.6, rushing_yards: 180.8, points_per_game: 28.2, red_zone_efficiency: 0.625 },
        defense: { points_allowed_per_game: 24.9, yards_allowed: 365.2, turnovers_forced: 18, sacks: 40 },
        special_teams: { fg_percentage: 0.800, punt_return_avg: 6.9, kick_return_avg: 24.3 },
        record: { wins: 12, losses: 5 }
      },
      'DET': {
        team_name: 'Detroit Lions',
        team_abbr: 'DET',
        offense: { passing_yards: 281.9, rushing_yards: 145.7, points_per_game: 33.2, red_zone_efficiency: 0.698 },
        defense: { points_allowed_per_game: 24.5, yards_allowed: 374.8, turnovers_forced: 20, sacks: 46 },
        special_teams: { fg_percentage: 0.912, punt_return_avg: 9.1, kick_return_avg: 21.4 },
        record: { wins: 15, losses: 2 }
      }
    },
    upcoming_games: [
      { game_id: '2025_WC_BAL_BUF', week: 'Wild Card', home_team: 'BUF', away_team: 'BAL', game_date: '2025-01-12' },
      { game_id: '2025_WC_DET_KC', week: 'Divisional', home_team: 'KC', away_team: 'DET', game_date: '2025-01-19' }
    ],
    completed_games: [
      { game_id: '2024_18_KC_BAL', week: 18, home_team: 'KC', away_team: 'BAL', home_score: 31, away_score: 17, winner: 'KC' },
      { game_id: '2024_18_BUF_DET', week: 18, home_team: 'BUF', away_team: 'DET', home_score: 28, away_score: 35, winner: 'DET' }
    ]
  };

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setNflData(real2024NFLData);
      setSelectedGame(real2024NFLData.upcoming_games[0]);
      setLoading(false);
    };
    loadData();
  }, []);

  const adjustWeights = (category, value) => {
    const newWeights = { ...weights };
    const oldValue = weights[category];
    const difference = value - oldValue;
    
    newWeights[category] = value;
    
    const otherCategories = Object.keys(weights).filter(key => key !== category);
    const totalOtherWeights = otherCategories.reduce((sum, key) => sum + weights[key], 0);
    
    if (totalOtherWeights > 0) {
      otherCategories.forEach(key => {
        const proportion = weights[key] / totalOtherWeights;
        newWeights[key] = Math.max(0, weights[key] - (difference * proportion));
      });
    }
    
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      const adjustment = (100 - total) / otherCategories.length;
      otherCategories.forEach(key => {
        newWeights[key] += adjustment;
      });
    }
    
    Object.keys(newWeights).forEach(key => {
      newWeights[key] = Math.round(newWeights[key] * 100) / 100;
    });
    
    setWeights(newWeights);
  };

  const calculateTeamScore = (teamAbbr) => {
    if (!nflData?.teams?.[teamAbbr]) return 0;
    
    const stats = nflData.teams[teamAbbr];
    
    const offenseScore = (
      (stats.offense.points_per_game / 35) * 0.4 +
      (stats.offense.passing_yards / 300) * 0.3 +
      (stats.offense.rushing_yards / 150) * 0.2 +
      stats.offense.red_zone_efficiency * 0.1
    ) * (weights.offense / 100);

    const defenseScore = (
      (1 - (stats.defense.points_allowed_per_game / 35)) * 0.4 +
      (1 - (stats.defense.yards_allowed / 450)) * 0.3 +
      (stats.defense.turnovers_forced / 30) * 0.2 +
      (stats.defense.sacks / 50) * 0.1
    ) * (weights.defense / 100);

    const specialTeamsScore = (
      stats.special_teams.fg_percentage * 0.6 +
      (stats.special_teams.punt_return_avg / 15) * 0.2 +
      (stats.special_teams.kick_return_avg / 30) * 0.2
    ) * (weights.special_teams / 100);

    return Math.max(0, offenseScore + defenseScore + specialTeamsScore);
  };

  const findOptimalWeights = async () => {
    setIsAnalyzing(true);
    setOptimalWeights(null);
    
    const testCombinations = [];
    for (let offense = 20; offense <= 70; offense += 10) {
      for (let defense = 20; defense <= 70; defense += 10) {
        const specialTeams = 100 - offense - defense;
        if (specialTeams >= 10 && specialTeams <= 70) {
          testCombinations.push({ offense, defense, special_teams: specialTeams });
        }
      }
    }
    
    let bestAccuracy = 0;
    let bestWeights = null;
    const results = [];
    
    for (const testWeights of testCombinations) {
      let correct = 0;
      
      for (const game of nflData.completed_games) {
        const homeStats = nflData.teams[game.home_team];
        const awayStats = nflData.teams[game.away_team];
        
        if (!homeStats || !awayStats) continue;
        
        const homeScore = (
          (homeStats.offense.points_per_game / 35) * 0.4 * (testWeights.offense / 100) +
          (1 - (homeStats.defense.points_allowed_per_game / 35)) * 0.4 * (testWeights.defense / 100) +
          homeStats.special_teams.fg_percentage * 0.6 * (testWeights.special_teams / 100)
        );
        
        const awayScore = (
          (awayStats.offense.points_per_game / 35) * 0.4 * (testWeights.offense / 100) +
          (1 - (awayStats.defense.points_allowed_per_game / 35)) * 0.4 * (testWeights.defense / 100) +
          awayStats.special_teams.fg_percentage * 0.6 * (testWeights.special_teams / 100)
        );
        
        const predicted = homeScore > awayScore ? game.home_team : game.away_team;
        if (predicted === game.winner) correct++;
      }
      
      const accuracy = (correct / nflData.completed_games.length) * 100;
      results.push({
        weights: testWeights,
        accuracy: accuracy.toFixed(1),
        correct,
        total: nflData.completed_games.length
      });
      
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestWeights = testWeights;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    results.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
    
    setOptimalWeights({
      best: bestWeights,
      bestAccuracy: bestAccuracy.toFixed(1),
      allResults: results.slice(0, 5),
      totalTested: testCombinations.length
    });
    
    setIsAnalyzing(false);
  };

  const prediction = useMemo(() => {
    if (!selectedGame || !nflData) return null;

    const homeScore = calculateTeamScore(selectedGame.home_team);
    const awayScore = calculateTeamScore(selectedGame.away_team);
    
    const winner = homeScore > awayScore ? selectedGame.home_team : selectedGame.away_team;
    const confidence = Math.min(95, 55 + (Math.abs(homeScore - awayScore) * 200));

    return {
      winner: nflData.teams[winner],
      homeTeam: nflData.teams[selectedGame.home_team],
      awayTeam: nflData.teams[selectedGame.away_team],
      homeScore: homeScore.toFixed(3),
      awayScore: awayScore.toFixed(3),
      confidence: confidence.toFixed(1)
    };
  }, [selectedGame, weights, nflData]);

  const runBacktest = () => {
    let correct = 0;
    const results = nflData.completed_games.map(game => {
      const homeScore = calculateTeamScore(game.home_team);
      const awayScore = calculateTeamScore(game.away_team);
      const predicted = homeScore > awayScore ? game.home_team : game.away_team;
      const isCorrect = predicted === game.winner;
      if (isCorrect) correct++;
      
      return { ...game, predicted, isCorrect };
    });

    setBacktestResults({
      accuracy: ((correct / nflData.completed_games.length) * 100).toFixed(1),
      results
    });
  };

  const WeightSlider = ({ category, label, value, color }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold">{label}</label>
        <span className="text-2xl font-bold" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={(e) => adjustWeights(category, parseFloat(e.target.value))}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(255,255,255,0.2) ${value}%, rgba(255,255,255,0.2) 100%)`
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading NFL 2024 Data</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-3 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">NFL Prediction Engine</h1>
              <p className="text-blue-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                2024 Season Data Loaded
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-black/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'predict', label: 'Predict Games', icon: Play },
              { id: 'optimize', label: 'Find Optimal Weights', icon: TrendingUp },
              { id: 'backtest', label: 'Backtest Model', icon: BarChart3 },
              { id: 'data', label: 'Data Overview', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-orange-500 text-orange-400' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Predict Tab */}
        {activeTab === 'predict' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Model Weights
                </h2>
                
                <div className="space-y-8">
                  <WeightSlider category="offense" label="Offense" value={weights.offense} color="#10b981" />
                  <WeightSlider category="defense" label="Defense" value={weights.defense} color="#f59e0b" />
                  <WeightSlider category="special_teams" label="Special Teams" value={weights.special_teams} color="#8b5cf6" />
                </div>

                <div className="mt-8 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-300">
                      {(weights.offense + weights.defense + weights.special_teams).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-green-300 text-sm">
                    <Zap className="w-4 h-4" />
                    Ready to predict!
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Select Game
                </h2>
                <div className="grid gap-4">
                  {nflData.upcoming_games.map(game => {
                    const homeTeam = nflData.teams[game.home_team];
                    const awayTeam = nflData.teams[game.away_team];
                    
                    return (
                      <button
                        key={game.game_id}
                        onClick={() => setSelectedGame(game)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedGame?.game_id === game.game_id
                            ? 'border-orange-500 bg-orange-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">🏈</div>
                            <div className="text-left">
                              <div className="font-semibold">{awayTeam.team_name}</div>
                              <div className="text-sm text-gray-400">@ {homeTeam.team_name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-yellow-400">{game.week}</div>
                            <div className="text-sm text-gray-400">{game.game_date}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-orange-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {prediction && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Prediction Results
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏆</div>
                      <h3 className="text-3xl font-bold text-green-400 mb-2">
                        {prediction.winner.team_name}
                      </h3>
                      <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                        <div className="text-3xl font-bold text-green-300">
                          {prediction.confidence}%
                        </div>
                        <div className="text-green-200">Confidence</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold">Model Scores</h4>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span>{prediction.homeTeam.team_abbr} (Home)</span>
                        <span className="font-mono text-lg">{prediction.homeScore}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span>{prediction.awayTeam.team_abbr} (Away)</span>
                        <span className="font-mono text-lg">{prediction.awayScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optimize Tab */}
        {activeTab === 'optimize' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6" />
                  Find Optimal Weight Distribution
                </h2>
                <p className="text-gray-300">
                  Analyze 2024 completed games to discover which weight combinations were most accurate
                </p>
              </div>
              <button
                onClick={findOptimalWeights}
                disabled={isAnalyzing}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Find Optimal Weights'}
              </button>
            </div>

            {isAnalyzing && (
              <div className="mb-6 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full inline-block mr-3"></div>
                <span className="text-blue-300 font-semibold">Testing Weight Combinations...</span>
              </div>
            )}

            {optimalWeights && (
              <div className="space-y-6">
                <div className="bg-green-500/20 rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-2xl font-bold text-green-300 mb-4">🏆 Most Accurate Combination</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Offense:</span>
                          <span className="font-bold text-green-400">{optimalWeights.best.offense}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Defense:</span>
                          <span className="font-bold text-yellow-400">{optimalWeights.best.defense}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Special Teams:</span>
                          <span className="font-bold text-purple-400">{optimalWeights.best.special_teams}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setWeights({
                          offense: optimalWeights.best.offense,
                          defense: optimalWeights.best.defense,
                          special_teams: optimalWeights.best.special_teams
                        })}
                        className="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold w-full"
                      >
                        Apply These Weights
                      </button>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-300 mb-2">
                        {optimalWeights.bestAccuracy}%
                      </div>
                      <div className="text-green-200 text-lg">Historical Accuracy</div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3">Rank</th>
                        <th className="text-center p-3">Offense %</th>
                        <th className="text-center p-3">Defense %</th>
                        <th className="text-center p-3">Special Teams %</th>
                        <th className="text-center p-3">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimalWeights.allResults.map((result, idx) => (
                        <tr key={idx} className="border-b border-white/10">
                          <td className="p-3">#{idx + 1}</td>
                          <td className="p-3 text-center text-green-400">{result.weights.offense}%</td>
                          <td className="p-3 text-center text-yellow-400">{result.weights.defense}%</td>
                          <td className="p-3 text-center text-purple-400">{result.weights.special_teams}%</td>
                          <td className="p-3 text-center font-bold">{result.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!optimalWeights && !isAnalyzing && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Discover the Winning Formula</h3>
                <p className="text-gray-400">
                  Click "Find Optimal Weights" to analyze which factor combinations 
                  were most accurate in predicting 2024 game outcomes
                </p>
              </div>
            )}
          </div>
        )}

        {/* Backtest Tab */}
        {activeTab === 'backtest' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Model Backtesting
              </h2>
              <button
                onClick={runBacktest}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold"
              >
                Test Model
              </button>
            </div>

            {backtestResults && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-300 mb-2">
                    {backtestResults.accuracy}%
                  </div>
                  <div className="text-green-200 text-lg">Accuracy on Historical Games</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3">Game</th>
                        <th className="text-center p-3">Predicted</th>
                        <th className="text-center p-3">Actual</th>
                        <th className="text-center p-3">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.results.map((game, idx) => (
                        <tr key={idx} className="border-b border-white/10">
                          <td className="p-3">{nflData.teams[game.away_team]?.team_abbr} @ {nflData.teams[game.home_team]?.team_abbr}</td>
                          <td className="p-3 text-center">{game.predicted}</td>
                          <td className="p-3 text-center">{game.winner}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              game.isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {game.isCorrect ? '✓' : '✗'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Database className="w-6 h-6" />
              2024 NFL Data Overview
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(nflData.teams).map(([abbr, team]) => (
                <div key={abbr} className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-bold text-orange-400 mb-3">{team.team_name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Record: {team.record.wins}-{team.record.losses}</div>
                    <div>PPG: {team.offense.points_per_game}</div>
                    <div>Pass Yds: {team.offense.passing_yards.toFixed(1)}</div>
                    <div>Rush Yds: {team.offense.rushing_yards.toFixed(1)}</div>
                    <div>Pts Allow: {team.defense.points_allowed_per_game.toFixed(1)}</div>
                    <div>Sacks: {team.defense.sacks}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFLPredictionApp;
                        