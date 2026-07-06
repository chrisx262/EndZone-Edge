// EndZone Edge — data loader / adapter.
//
// Loads the real JSON produced by scripts/fetch_data.py (public/data/*.json)
// and adapts it to the shape NFLPredictionApp expects, so the app's scoring
// code is untouched. All per-game -> season-total and unit conversions live
// HERE, in one place.
//
// Field mapping notes (see PROGRESS.md T2):
//  - turnovers_forced / sacks: app scores them as SEASON TOTALS -> per-game * 17
//  - fg_percentage: app wants a 0-1 fraction -> fg_pct / 100
//  - red_zone_efficiency: NOT in free nflverse team stats. Uses a neutral
//    constant (same for every team, so it cancels in any A-vs-B comparison).
//    Honest placeholder, not a fabricated per-team number. Revisit via pbp.

const RED_ZONE_PLACEHOLDER = 0.6
const GAMES_PER_SEASON = 17

const TEAM_NAMES: Record<string, string> = {
  ARI: 'Arizona Cardinals', ATL: 'Atlanta Falcons', BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills', CAR: 'Carolina Panthers', CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals', CLE: 'Cleveland Browns', DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos', DET: 'Detroit Lions', GB: 'Green Bay Packers',
  HOU: 'Houston Texans', IND: 'Indianapolis Colts', JAX: 'Jacksonville Jaguars',
  KC: 'Kansas City Chiefs', LV: 'Las Vegas Raiders', LAC: 'Los Angeles Chargers',
  LA: 'Los Angeles Rams', LAR: 'Los Angeles Rams', MIA: 'Miami Dolphins',
  MIN: 'Minnesota Vikings', NE: 'New England Patriots', NO: 'New Orleans Saints',
  NYG: 'New York Giants', NYJ: 'New York Jets', PHI: 'Philadelphia Eagles',
  PIT: 'Pittsburgh Steelers', SEA: 'Seattle Seahawks', SF: 'San Francisco 49ers',
  TB: 'Tampa Bay Buccaneers', TEN: 'Tennessee Titans', WAS: 'Washington Commanders',
}

interface RawTeam {
  team: string
  offense: { pts_pg: number; yds_pg: number; rush_yds_pg: number; pass_yds_pg: number; turnovers_pg: number }
  defense: { pts_allowed_pg: number; yds_allowed_pg: number; takeaways_pg: number; sacks_pg: number }
  special: { fg_pct: number; punt_net_avg: number | null; kick_ret_avg: number; punt_ret_avg: number }
}

interface RawGame {
  game_id: string; week: number; home: string; away: string; kickoff: string
  home_score: number | null; away_score: number | null; final: boolean
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json()
}

function recordsFromSchedule(games: RawGame[]) {
  const rec: Record<string, { wins: number; losses: number }> = {}
  for (const g of games) {
    if (!g.final || g.home_score == null || g.away_score == null) continue
    const home = rec[g.home] ?? (rec[g.home] = { wins: 0, losses: 0 })
    const away = rec[g.away] ?? (rec[g.away] = { wins: 0, losses: 0 })
    if (g.home_score > g.away_score) { home.wins++; away.losses++ }
    else if (g.away_score > g.home_score) { away.wins++; home.losses++ }
  }
  return rec
}

export interface SeasonData {
  season: number
  teams: Record<string, any>
  upcoming_games: any[]
  completed_games: any[]
}

export async function loadSeasonData(season: number): Promise<SeasonData> {
  const [rawTeams, rawGames] = await Promise.all([
    getJSON<RawTeam[]>(`data/teams_${season}.json`),
    getJSON<RawGame[]>(`data/schedule_${season}.json`),
  ])

  const records = recordsFromSchedule(rawGames)

  const teams: Record<string, any> = {}
  for (const t of rawTeams) {
    teams[t.team] = {
      team_name: TEAM_NAMES[t.team] ?? t.team,
      team_abbr: t.team,
      offense: {
        points_per_game: t.offense.pts_pg,
        passing_yards: t.offense.pass_yds_pg,
        rushing_yards: t.offense.rush_yds_pg,
        red_zone_efficiency: RED_ZONE_PLACEHOLDER,
      },
      defense: {
        points_allowed_per_game: t.defense.pts_allowed_pg,
        yards_allowed: t.defense.yds_allowed_pg,
        turnovers_forced: Math.round((t.defense.takeaways_pg ?? 0) * GAMES_PER_SEASON),
        sacks: Math.round((t.defense.sacks_pg ?? 0) * GAMES_PER_SEASON),
      },
      special_teams: {
        fg_percentage: (t.special.fg_pct ?? 0) / 100,
        punt_return_avg: t.special.punt_ret_avg ?? 0,
        kick_return_avg: t.special.kick_ret_avg ?? 0,
      },
      record: records[t.team] ?? { wins: 0, losses: 0 },
    }
  }

  const completed_games = rawGames
    .filter((g) => g.final && g.home_score != null && g.away_score != null)
    .map((g) => ({
      game_id: g.game_id, week: g.week,
      home_team: g.home, away_team: g.away,
      home_score: g.home_score, away_score: g.away_score,
      winner: (g.home_score as number) > (g.away_score as number) ? g.home : g.away,
    }))

  // Upcoming = scheduled-but-unplayed games. For a fully-completed season
  // (2024/2025) there are none, so fall back to the latest week's slate as
  // the demo prediction card set.
  let upcoming = rawGames.filter((g) => !g.final)
  if (upcoming.length === 0 && rawGames.length) {
    const lastWeek = Math.max(...rawGames.map((g) => g.week))
    upcoming = rawGames.filter((g) => g.week === lastWeek)
  }
  const upcoming_games = upcoming.map((g) => ({
    game_id: g.game_id, week: g.week,
    home_team: g.home, away_team: g.away,
    game_date: g.kickoff?.slice(0, 10) ?? '',
  }))

  return { season, teams, upcoming_games, completed_games }
}
