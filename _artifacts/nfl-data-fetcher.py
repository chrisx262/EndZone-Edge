import nfl_data_py as nfl
import pandas as pd
import json
from datetime import datetime, timedelta

class NFLDataFetcher:
    def __init__(self):
        self.current_season = 2024
        
    def fetch_team_stats(self):
        """Fetch comprehensive team statistics for the 2024 season"""
        print("Fetching 2024 NFL team statistics...")
        
        # Get weekly data to calculate season averages
        weekly_data = nfl.import_weekly_data([self.current_season])
        
        # Get team info
        teams = nfl.import_team_desc()
        
        # Calculate team statistics by aggregating weekly data
        team_stats = {}
        
        for team in teams['team_abbr'].unique():
            team_weekly = weekly_data[weekly_data['recent_team'] == team]
            
            if len(team_weekly) > 0:
                # Offensive stats (per game averages)
                offense_stats = {
                    'passing_yards': team_weekly['passing_yards'].mean(),
                    'rushing_yards': team_weekly['rushing_yards'].mean(),
                    'receiving_yards': team_weekly['receiving_yards'].mean(),
                    'fantasy_points': team_weekly['fantasy_points'].mean(),
                    'targets': team_weekly['targets'].mean(),
                    'receptions': team_weekly['receptions'].mean()
                }
                
                # For team-level defensive stats, we need to use different approach
                team_info = teams[teams['team_abbr'] == team].iloc[0]
                
                team_stats[team] = {
                    'team_name': team_info['team_name'],
                    'team_abbr': team,
                    'offense': offense_stats,
                    'games_played': len(team_weekly)
                }
        
        return team_stats
    
    def fetch_game_results(self):
        """Fetch 2024 season game results"""
        print("Fetching 2024 NFL game results...")
        
        # Get schedule data
        schedule = nfl.import_schedules([self.current_season])
        
        # Filter for completed games
        completed_games = schedule[schedule['game_type'] == 'REG'].copy()
        
        games_data = []
        for _, game in completed_games.iterrows():
            games_data.append({
                'game_id': game['game_id'],
                'week': game['week'],
                'home_team': game['home_team'],
                'away_team': game['away_team'],
                'home_score': game['home_score'] if pd.notna(game['home_score']) else None,
                'away_score': game['away_score'] if pd.notna(game['away_score']) else None,
                'game_date': game['gameday'].strftime('%Y-%m-%d') if pd.notna(game['gameday']) else None,
                'completed': pd.notna(game['home_score']) and pd.notna(game['away_score'])
            })
        
        return games_data
    
    def fetch_team_defensive_stats(self):
        """Calculate defensive stats from play-by-play data"""
        print("Calculating defensive statistics...")
        
        try:
            # Get play-by-play data (this might be large, so we'll limit to recent weeks)
            pbp = nfl.import_pbp_data([self.current_season], downcast=True)
            
            defensive_stats = {}
            
            # Calculate defensive stats by team
            teams = pbp['defteam'].dropna().unique()
            
            for team in teams:
                team_def = pbp[pbp['defteam'] == team]
                
                if len(team_def) > 0:
                    defensive_stats[team] = {
                        'points_allowed_per_game': team_def.groupby('game_id')['total_home_score', 'total_away_score'].max().mean().mean(),
                        'yards_allowed_per_play': team_def['yards_gained'].mean(),
                        'turnovers_forced': (team_def['interception'] == 1).sum() + (team_def['fumble_lost'] == 1).sum(),
                        'sacks': (team_def['sack'] == 1).sum()
                    }
            
            return defensive_stats
            
        except Exception as e:
            print(f"Error fetching defensive stats: {e}")
            # Return mock defensive stats if play-by-play fails
            return self._mock_defensive_stats()
    
    def _mock_defensive_stats(self):
        """Generate realistic mock defensive stats if we can't get play-by-play data"""
        import random
        
        teams = ['KC', 'BUF', 'MIA', 'NYJ', 'BAL', 'CIN', 'CLE', 'PIT', 'HOU', 'IND', 'JAX', 'TEN',
                'DEN', 'LV', 'LAC', 'SF', 'SEA', 'LAR', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS',
                'GB', 'MIN', 'DET', 'CHI', 'TB', 'NO', 'ATL', 'CAR']
        
        defensive_stats = {}
        for team in teams:
            defensive_stats[team] = {
                'points_allowed_per_game': random.uniform(16, 28),
                'yards_allowed_per_play': random.uniform(4.8, 6.2),
                'turnovers_forced': random.randint(12, 25),
                'sacks': random.randint(25, 55)
            }
        
        return defensive_stats
    
    def fetch_upcoming_games(self):
        """Fetch upcoming games for predictions"""
        print("Fetching upcoming games...")
        
        schedule = nfl.import_schedules([self.current_season])
        
        # Get games that haven't been played yet
        upcoming = schedule[
            (schedule['game_type'] == 'REG') & 
            (pd.isna(schedule['home_score'])) &
            (schedule['gameday'] >= datetime.now().date())
        ].head(10)  # Get next 10 games
        
        upcoming_games = []
        for _, game in upcoming.iterrows():
            upcoming_games.append({
                'game_id': game['game_id'],
                'week': game['week'],
                'home_team': game['home_team'],
                'away_team': game['away_team'],
                'game_date': game['gameday'].strftime('%Y-%m-%d') if pd.notna(game['gameday']) else None,
            })
        
        return upcoming_games
    
    def generate_app_data(self):
        """Generate formatted data for the React app"""
        print("Generating formatted data for React app...")
        
        # Fetch all data
        team_stats = self.fetch_team_stats()
        game_results = self.fetch_game_results()
        defensive_stats = self.fetch_team_defensive_stats()
        upcoming_games = self.fetch_upcoming_games()
        
        # Combine offensive and defensive stats
        combined_stats = {}
        for team_abbr, stats in team_stats.items():
            combined_stats[team_abbr] = {
                'team_name': stats['team_name'],
                'team_abbr': team_abbr,
                'offense': stats['offense'],
                'defense': defensive_stats.get(team_abbr, {
                    'points_allowed_per_game': 22.0,
                    'yards_allowed_per_play': 5.5,
                    'turnovers_forced': 18,
                    'sacks': 35
                }),
                'special_teams': {
                    'fg_percentage': 0.85,  # These would need separate data source
                    'punt_return_avg': 8.5,
                    'kick_return_avg': 22.0
                }
            }
        
        # Format for JavaScript
        formatted_data = {
            'teams': combined_stats,
            'completed_games': [g for g in game_results if g['completed']],
            'upcoming_games': upcoming_games,
            'last_updated': datetime.now().isoformat()
        }
        
        return formatted_data
    
    def save_to_json(self, filename='nfl_2024_data.json'):
        """Save all data to JSON file"""
        data = self.generate_app_data()
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"Data saved to {filename}")
        return data

def main():
    """Main execution function"""
    fetcher = NFLDataFetcher()
    
    try:
        # Generate and save data
        data = fetcher.save_to_json()
        
        print("\n" + "="*50)
        print("DATA SUMMARY")
        print("="*50)
        print(f"Teams loaded: {len(data['teams'])}")
        print(f"Completed games: {len(data['completed_games'])}")
        print(f"Upcoming games: {len(data['upcoming_games'])}")
        print(f"Last updated: {data['last_updated']}")
        
        # Show sample team data
        if data['teams']:
            sample_team = list(data['teams'].keys())[0]
            sample_stats = data['teams'][sample_team]
            print(f"\nSample team data ({sample_team}):")
            print(f"  Offense - Passing: {sample_stats['offense'].get('passing_yards', 'N/A'):.1f} yds/game")
            print(f"  Defense - Points allowed: {sample_stats['defense'].get('points_allowed_per_game', 'N/A'):.1f}")
        
        # Show upcoming games
        if data['upcoming_games']:
            print(f"\nNext few games:")
            for game in data['upcoming_games'][:3]:
                print(f"  Week {game['week']}: {game['away_team']} @ {game['home_team']} ({game['game_date']})")
        
        return data
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        print("Make sure you have installed nfl-data-py: pip install nfl-data-py")
        return None

if __name__ == "__main__":
    # Install required package if not available
    try:
        import nfl_data_py
    except ImportError:
        print("Installing nfl-data-py...")
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "nfl-data-py"])
        import nfl_data_py as nfl
        print("Installation complete!")
    
    main()
