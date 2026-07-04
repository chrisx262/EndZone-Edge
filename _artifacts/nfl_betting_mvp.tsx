import React, { useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, RotateCcw, Save } from 'lucide-react';

// Mock 2023 NFL team data
const nflTeams = {
  'Kansas City Chiefs': {
    offense: { rank: 1, ppg: 28.5, yards: 403.6, line_score: 92 },
    defense: { rank: 3, pa: 19.8, takeaways: 18, line_score: 88 },
    special_teams: { rank: 2, fg_pct: 88, return_avg: 8.2, score: 85 }
  },
  'Buffalo Bills': {
    offense: { rank: 4, ppg: 26.2, yards: 374.0, line_score: 86 },
    defense: { rank: 8, pa: 21.5, takeaways: 22, line_score: 82 },
    special_teams: { rank: 12, fg_pct: 85, return_avg: 7.8, score: 78 }
  },
  'San Francisco 49ers': {
    offense: { rank: 6, ppg: 25.8, yards: 388.1, line_score: 84 },
    defense: { rank: 1, pa: 18.9, takeaways: 25, line_score: 95 },
    special_teams: { rank: 5, fg_pct: 91, return_avg: 9.1, score: 82 }
  },
  'Philadelphia Eagles': {
    offense: { rank: 3, ppg: 27.1, yards: 383.9, line_score: 89 },
    defense: { rank: 10, pa: 20.3, takeaways: 20, line_score: 80 },
    special_teams: { rank: 8, fg_pct: 87, return_avg: 8.5, score: 79 }
  },
  'Dallas Cowboys': {
    offense: { rank: 7, ppg: 25.1, yards: 365.2, line_score: 83 },
    defense: { rank: 5, pa: 20.1, takeaways: 21, line_score: 85 },
    special_teams: { rank: 15, fg_pct: 82, return_avg: 7.2, score: 75 }
  },
  'Miami Dolphins': {
    offense: { rank: 2, ppg: 27.8, yards: 401.3, line_score: 91 },
    defense: { rank: 15, pa: 24.2, takeaways: 16, line_score: 72 },
    special_teams: { rank: 10, fg_pct: 86, return_avg: 8.0, score: 78 }
  }
};

// This week's games
const weeklyGames = [
  { 
    id: 1, 
    away: 'Buffalo Bills', 
    home: 'Kansas City Chiefs', 
    time: 'Sun 4:30 PM',
    week: 'Divisional Round'
  },
  { 
    id: 2, 
    away: 'Philadelphia Eagles', 
    home: 'San Francisco 49ers', 
    time: 'Sun 8:15 PM',
    week: 'Divisional Round' 
  },
  { 
    id: 3, 
    away: 'Dallas Cowboys', 
    home: 'Miami Dolphins', 
    time: 'Mon 8:15 PM',
    week: 'Wild Card'
  }
];

const NFLBettingApp = () => {
  const [offenseWeight, setOffenseWeight] = useState(40);
  const [defenseWeight, setDefenseWeight] = useState(50);
  const [specialTeamsWeight, setSpecialTeamsWeight] = useState(10);
  const [savedPreferences, setSavedPreferences] = useState(null);

  // Ensure weights total 100%
  const adjustWeights = (category, newValue) => {
    const value = Math.max(0, Math.min(100, newValue));
    
    if (category === 'offense') {
      const remaining = 100 - value;
      const defRatio = defenseWeight / (defenseWeight + specialTeamsWeight);
      const newDefense = Math.round(remaining * defRatio);
      const newSpecial = remaining - newDefense;
      
      setOffenseWeight(value);
      setDefenseWeight(newDefense);
      setSpecialTeamsWeight(newSpecial);
    } else if (category === 'defense') {
      const remaining = 100 - value;
      const offRatio = offenseWeight / (offenseWeight + specialTeamsWeight);
      const newOffense = Math.round(remaining * offRatio);
      const newSpecial = remaining - newOffense;
      
      setDefenseWeight(value);
      setOffenseWeight(newOffense);
      setSpecialTeamsWeight(newSpecial);
    } else if (category === 'special') {
      const remaining = 100 - value;
      const offRatio = offenseWeight / (offenseWeight + defenseWeight);
      const newOffense = Math.round(remaining * offRatio);
      const newDefense = remaining - newOffense;
      
      setSpecialTeamsWeight(value);
      setOffenseWeight(newOffense);
      setDefenseWeight(newDefense);
    }
  };

  // Calculate team strength based on your philosophy (emphasizing lines, takeaways, run game)
  const calculateTeamStrength = (teamName) => {
    const team = nflTeams[teamName];
    if (!team) return 50;

    // Your philosophy weights: emphasize lines, takeaways, run game
    const offenseScore = team.offense.line_score * 0.4 + // Offensive line emphasis
                       (team.offense.ppg / 35 * 100) * 0.35 + // Run game/scoring
                       (team.offense.yards / 450 * 100) * 0.25; // Total offense

    const defenseScore = team.defense.line_score * 0.4 + // Defensive line emphasis  
                        (team.defense.takeaways / 30 * 100) * 0.4 + // Takeaways emphasis
                        ((35 - team.defense.pa) / 35 * 100) * 0.2; // Points allowed

    const specialScore = team.special_teams.score;

    const weightedScore = 
      (offenseScore * offenseWeight / 100) +
      (defenseScore * defenseWeight / 100) +
      (specialScore * specialTeamsWeight / 100);

    return Math.round(weightedScore);
  };

  // Generate prediction with win probability and point spread
  const generatePrediction = (game) => {
    const homeStrength = calculateTeamStrength(game.home);
    const awayStrength = calculateTeamStrength(game.away);
    
    // Home field advantage
    const adjustedHomeStrength = homeStrength + 3;
    
    const strengthDiff = adjustedHomeStrength - awayStrength;
    
    // Convert to win probability (sigmoid-like function)
    const winProbability = 50 + (strengthDiff * 0.8);
    const homeWinProb = Math.max(15, Math.min(85, winProbability));
    
    // Convert to point spread
    const pointSpread = strengthDiff * 0.15;
    const spread = Math.round(pointSpread * 2) / 2; // Round to nearest 0.5
    
    return {
      homeWinProb: Math.round(homeWinProb),
      awayWinProb: Math.round(100 - homeWinProb),
      spread: spread,
      homeStrength: adjustedHomeStrength,
      awayStrength: awayStrength
    };
  };

  // Reset to your preferred defaults (line play, defense, takeaways)
  const resetToDefaults = () => {
    setOffenseWeight(35); // Lower because you believe in defense
    setDefenseWeight(55); // Higher because "defense wins championships"
    setSpecialTeamsWeight(10);
  };

  // Save current preferences
  const savePreferences = () => {
    const prefs = {
      offense: offenseWeight,
      defense: defenseWeight,
      special: specialTeamsWeight,
      timestamp: new Date().toLocaleString()
    };
    setSavedPreferences(prefs);
  };

  const totalWeight = offenseWeight + defenseWeight + specialTeamsWeight;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
        <h1 className="text-4xl font-bold text-center mb-2">
          🏈 NFL Betting Model
        </h1>
        <p className="text-center text-gray-300 text-lg">
          Build Your Personal Prediction Model
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Philosophy Sliders */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
            Your Football Philosophy
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Offense Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <span className="text-xl font-semibold">Offense</span>
                </div>
                <span className="text-3xl font-bold text-green-400">{offenseWeight}%</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={offenseWeight}
                  onChange={(e) => adjustWeights('offense', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
                />
              </div>
              
              <p className="text-sm text-gray-400">
                Line play, run game, scoring efficiency
              </p>
            </div>

            {/* Defense Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-semibold">Defense</span>
                </div>
                <span className="text-3xl font-bold text-blue-400">{defenseWeight}%</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={defenseWeight}
                  onChange={(e) => adjustWeights('defense', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                />
              </div>
              
              <p className="text-sm text-gray-400">
                Pass rush, takeaways, points allowed
              </p>
            </div>

            {/* Special Teams Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-purple-400" />
                  <span className="text-xl font-semibold">Special Teams</span>
                </div>
                <span className="text-3xl font-bold text-purple-400">{specialTeamsWeight}%</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialTeamsWeight}
                  onChange={(e) => adjustWeights('special', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                />
              </div>
              
              <p className="text-sm text-gray-400">
                Field goals, returns, field position
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Defense Wins</span>
            </button>
            <button
              onClick={savePreferences}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Model</span>
            </button>
          </div>

          {/* Weight validation */}
          <div className="text-center mt-4">
            <span className={`text-lg ${totalWeight === 100 ? 'text-green-400' : 'text-red-400'}`}>
              Total: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
            </span>
          </div>
        </div>

        {/* Games & Predictions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-blue-400">
            This Week's Predictions
          </h2>
          
          {weeklyGames.map(game => {
            const prediction = generatePrediction(game);
            const favorite = prediction.spread > 0 ? game.home : game.away;
            const underdog = prediction.spread > 0 ? game.away : game.home;
            const spreadValue = Math.abs(prediction.spread);
            
            return (
              <div key={game.id} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  
                  {/* Game Info */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{game.week}</div>
                    <div className="text-2xl font-bold my-2">
                      {game.away} @ {game.home}
                    </div>
                    <div className="text-gray-400">{game.time}</div>
                  </div>

                  {/* Predictions */}
                  <div className="text-center space-y-3">
                    <div className="text-sm text-gray-400">WIN PROBABILITY</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={game.home === favorite ? 'text-green-400 font-bold' : 'text-gray-300'}>
                          {game.home}
                        </span>
                        <span className={`text-xl font-bold ${game.home === favorite ? 'text-green-400' : 'text-gray-300'}`}>
                          {prediction.homeWinProb}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={game.away === favorite ? 'text-green-400 font-bold' : 'text-gray-300'}>
                          {game.away}
                        </span>
                        <span className={`text-xl font-bold ${game.away === favorite ? 'text-green-400' : 'text-gray-300'}`}>
                          {prediction.awayWinProb}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Point Spread */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">POINT SPREAD</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {favorite} -{spreadValue}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Strength: {favorite === game.home ? prediction.homeStrength : prediction.awayStrength} vs {favorite === game.home ? prediction.awayStrength : prediction.homeStrength}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Philosophy Summary */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-center mb-4 text-purple-400">Your Betting Philosophy</h3>
          <div className="text-center space-y-2">
            <p className="text-gray-300">
              You believe <span className="text-green-400 font-bold">{offenseWeight > defenseWeight ? 'offense' : 'defense'}</span> is most important
            </p>
            <p className="text-sm text-gray-400">
              Emphasizing: Offensive/Defensive lines, takeaways, and the running game
            </p>
            {savedPreferences && (
              <p className="text-xs text-purple-400">
                Model saved: {savedPreferences.timestamp}
              </p>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
        }
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e3a8a;
        }
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #5b21b6;
        }
      `}</style>
    </div>
  );
};

export default NFLBettingApp;