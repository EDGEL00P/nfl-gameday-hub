import type { VercelRequest, VercelResponse } from '@vercel/node';
import Papa from 'papaparse';

// NFLVerse Data URL (Weekly Player Stats)
// Using 2024 as 2025 might not be fully populated/released yet in this dataset format, 
// or allows fallback. The user is in Feb 2026, so 2025 season is concluding.
// We'll try 2025 first, then 2024.
// For stability, let's target the latest full dataset available.
// https://github.com/nflverse/nflverse-data/releases/tag/player_stats
const STATS_URL_2025 = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2025.csv';
const STATS_URL_2024 = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2024.csv';

interface AdvancedStats {
  player_id: string;
  player_name: string;
  recent_games: any[];
  season_totals: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour

  try {
    const { player_id, name } = req.query;

    if (!name && !player_id) {
      return res.status(400).json({ error: 'Player name or ID required' });
    }

    // Fetch CSV data
    // Try 2025 first (current season)
    let csvData = '';
    let response = await fetch(STATS_URL_2025);
    
    if (!response.ok) {
      // Fallback to 2024 if 2025 not found/error
      console.log('2025 stats not found, fetching 2024');
      response = await fetch(STATS_URL_2024);
    }

    if (!response.ok) {
        throw new Error('Failed to fetch stats data');
    }

    csvData = await response.text();

    // Parse CSV
    const { data } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    // Filter for player
    // NFLVerse uses gsis_id or display_name
    // BallDontLie uses its own ID. We need to match by Name.
    const searchName = String(name || '').toLowerCase();
    
    const playerStats = (data as any[]).filter((row: any) => 
      row.player_display_name?.toLowerCase() === searchName ||
      row.player_name?.toLowerCase() === searchName
    );

    if (playerStats.length === 0) {
      return res.json({ message: 'No advanced stats found', data: null });
    }

    // Aggregate Stats
    // NFLVerse gives weekly stats. We can calculate totals and advanced metrics.
    // Key Advanced Metrics:
    // - EPA (Expected Points Added) - passing_epa, rushing_epa, receiving_epa
    // - CPOE (Completion Percentage Over Expected) - cpoe
    // - Air Yards - air_yards_share, wopr
    
    const seasonTotals = playerStats.reduce((acc: any, game: any) => {
      acc.games = (acc.games || 0) + 1;
      acc.passing_epa = (acc.passing_epa || 0) + parseFloat(game.passing_epa || 0);
      acc.rushing_epa = (acc.rushing_epa || 0) + parseFloat(game.rushing_epa || 0);
      acc.receiving_epa = (acc.receiving_epa || 0) + parseFloat(game.receiving_epa || 0);
      acc.total_epa = (acc.total_epa || 0) + parseFloat(game.pacr || 0); // Using PACR as proxy or check other cols
      
      // Accumulate raw stats for validation
      acc.passing_yards = (acc.passing_yards || 0) + parseFloat(game.passing_yards || 0);
      acc.rushing_yards = (acc.rushing_yards || 0) + parseFloat(game.rushing_yards || 0);
      
      return acc;
    }, {});

    // Calculate averages
    const games = seasonTotals.games || 1;
    const advanced = {
      epa_per_game: (seasonTotals.passing_epa + seasonTotals.rushing_epa + seasonTotals.receiving_epa) / games,
      passing_epa_total: seasonTotals.passing_epa,
      rushing_epa_total: seasonTotals.rushing_epa,
      receiving_epa_total: seasonTotals.receiving_epa,
      season_yards_check: seasonTotals.passing_yards + seasonTotals.rushing_yards
    };

    const orderedGames = playerStats.sort((a: any, b: any) => parseInt(b.week) - parseInt(a.week));

    res.json({
      source: 'nflverse',
      season: '2025',
      advanced_metrics: advanced,
      recent_games: orderedGames.slice(0, 10).map((g: any) => ({
        week: g.week,
        opponent: g.opponent_team,
        passing_epa: parseFloat(g.passing_epa || 0).toFixed(2),
        rushing_epa: parseFloat(g.rushing_epa || 0).toFixed(2),
        receiving_epa: parseFloat(g.receiving_epa || 0).toFixed(2),
        fantasy_points: parseFloat(g.fantasy_points || 0).toFixed(1),
        fantasy_points_ppr: parseFloat(g.fantasy_points_ppr || 0).toFixed(1)
      }))
    });

  } catch (err: any) {
    console.error('Advanced stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
