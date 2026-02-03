import type { NFLGame, NFLNews, NFLTeam, StandingsEntry, TicketListing, Play } from "@shared/schema";

// NFL Teams data - same as client-side but for server use
const NFL_TEAMS_DATA: NFLTeam[] = [
  // AFC East
  { id: "buf", name: "Bills", abbreviation: "BUF", displayName: "Buffalo Bills", shortDisplayName: "Bills", location: "Buffalo", color: "#00338D", alternateColor: "#C60C30", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png", conference: "AFC", division: "East", stadium: { id: "highmark", name: "Highmark Stadium", city: "Orchard Park", state: "NY", country: "USA", capacity: 71608, surface: "Grass", roofType: "Open", latitude: 42.7738, longitude: -78.787, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "mia", name: "Dolphins", abbreviation: "MIA", displayName: "Miami Dolphins", shortDisplayName: "Dolphins", location: "Miami", color: "#008E97", alternateColor: "#FC4C02", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png", conference: "AFC", division: "East", stadium: { id: "hardrock", name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", country: "USA", capacity: 65326, surface: "Grass", roofType: "Open", latitude: 25.958, longitude: -80.2389, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "ne", name: "Patriots", abbreviation: "NE", displayName: "New England Patriots", shortDisplayName: "Patriots", location: "New England", color: "#002244", alternateColor: "#C60C30", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png", conference: "AFC", division: "East", stadium: { id: "gillette", name: "Gillette Stadium", city: "Foxborough", state: "MA", country: "USA", capacity: 65878, surface: "FieldTurf", roofType: "Open", latitude: 42.0909, longitude: -71.2643, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "nyj", name: "Jets", abbreviation: "NYJ", displayName: "New York Jets", shortDisplayName: "Jets", location: "New York", color: "#125740", alternateColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png", conference: "AFC", division: "East", stadium: { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", state: "NJ", country: "USA", capacity: 82500, surface: "FieldTurf", roofType: "Open", latitude: 40.8135, longitude: -74.0745, timezone: "America/New_York", sections: [], amenities: [] } },
  // AFC North
  { id: "bal", name: "Ravens", abbreviation: "BAL", displayName: "Baltimore Ravens", shortDisplayName: "Ravens", location: "Baltimore", color: "#241773", alternateColor: "#9E7C0C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png", conference: "AFC", division: "North", stadium: { id: "mt-bank", name: "M&T Bank Stadium", city: "Baltimore", state: "MD", country: "USA", capacity: 71008, surface: "Grass", roofType: "Open", latitude: 39.278, longitude: -76.6227, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "cin", name: "Bengals", abbreviation: "CIN", displayName: "Cincinnati Bengals", shortDisplayName: "Bengals", location: "Cincinnati", color: "#FB4F14", alternateColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", conference: "AFC", division: "North", stadium: { id: "paycor", name: "Paycor Stadium", city: "Cincinnati", state: "OH", country: "USA", capacity: 65515, surface: "Grass", roofType: "Open", latitude: 39.0954, longitude: -84.516, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "cle", name: "Browns", abbreviation: "CLE", displayName: "Cleveland Browns", shortDisplayName: "Browns", location: "Cleveland", color: "#311D00", alternateColor: "#FF3C00", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", conference: "AFC", division: "North", stadium: { id: "cleveland", name: "Cleveland Browns Stadium", city: "Cleveland", state: "OH", country: "USA", capacity: 67431, surface: "Grass", roofType: "Open", latitude: 41.506, longitude: -81.6996, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "pit", name: "Steelers", abbreviation: "PIT", displayName: "Pittsburgh Steelers", shortDisplayName: "Steelers", location: "Pittsburgh", color: "#FFB612", alternateColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", conference: "AFC", division: "North", stadium: { id: "acrisure", name: "Acrisure Stadium", city: "Pittsburgh", state: "PA", country: "USA", capacity: 68400, surface: "Grass", roofType: "Open", latitude: 40.4468, longitude: -80.0158, timezone: "America/New_York", sections: [], amenities: [] } },
  // AFC South
  { id: "hou", name: "Texans", abbreviation: "HOU", displayName: "Houston Texans", shortDisplayName: "Texans", location: "Houston", color: "#03202F", alternateColor: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png", conference: "AFC", division: "South", stadium: { id: "nrg", name: "NRG Stadium", city: "Houston", state: "TX", country: "USA", capacity: 72220, surface: "Grass", roofType: "Retractable", latitude: 29.6847, longitude: -95.4107, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "ind", name: "Colts", abbreviation: "IND", displayName: "Indianapolis Colts", shortDisplayName: "Colts", location: "Indianapolis", color: "#002C5F", alternateColor: "#A2AAAD", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png", conference: "AFC", division: "South", stadium: { id: "lucas", name: "Lucas Oil Stadium", city: "Indianapolis", state: "IN", country: "USA", capacity: 67000, surface: "FieldTurf", roofType: "Retractable", latitude: 39.7601, longitude: -86.1639, timezone: "America/Indiana/Indianapolis", sections: [], amenities: [] } },
  { id: "jax", name: "Jaguars", abbreviation: "JAX", displayName: "Jacksonville Jaguars", shortDisplayName: "Jaguars", location: "Jacksonville", color: "#006778", alternateColor: "#9F792C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png", conference: "AFC", division: "South", stadium: { id: "tiaa", name: "TIAA Bank Field", city: "Jacksonville", state: "FL", country: "USA", capacity: 67814, surface: "Grass", roofType: "Open", latitude: 30.324, longitude: -81.6373, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "ten", name: "Titans", abbreviation: "TEN", displayName: "Tennessee Titans", shortDisplayName: "Titans", location: "Tennessee", color: "#0C2340", alternateColor: "#4B92DB", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png", conference: "AFC", division: "South", stadium: { id: "nissan", name: "Nissan Stadium", city: "Nashville", state: "TN", country: "USA", capacity: 69143, surface: "Grass", roofType: "Open", latitude: 36.1665, longitude: -86.7713, timezone: "America/Chicago", sections: [], amenities: [] } },
  // AFC West
  { id: "den", name: "Broncos", abbreviation: "DEN", displayName: "Denver Broncos", shortDisplayName: "Broncos", location: "Denver", color: "#FB4F14", alternateColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", conference: "AFC", division: "West", stadium: { id: "empower", name: "Empower Field at Mile High", city: "Denver", state: "CO", country: "USA", capacity: 76125, surface: "Grass", roofType: "Open", latitude: 39.7439, longitude: -105.02, timezone: "America/Denver", sections: [], amenities: [] } },
  { id: "kc", name: "Chiefs", abbreviation: "KC", displayName: "Kansas City Chiefs", shortDisplayName: "Chiefs", location: "Kansas City", color: "#E31837", alternateColor: "#FFB81C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png", conference: "AFC", division: "West", stadium: { id: "arrowhead", name: "GEHA Field at Arrowhead Stadium", city: "Kansas City", state: "MO", country: "USA", capacity: 76416, surface: "Grass", roofType: "Open", latitude: 39.0489, longitude: -94.4839, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "lv", name: "Raiders", abbreviation: "LV", displayName: "Las Vegas Raiders", shortDisplayName: "Raiders", location: "Las Vegas", color: "#000000", alternateColor: "#A5ACAF", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", conference: "AFC", division: "West", stadium: { id: "allegiant", name: "Allegiant Stadium", city: "Las Vegas", state: "NV", country: "USA", capacity: 65000, surface: "Grass", roofType: "Dome", latitude: 36.0909, longitude: -115.1833, timezone: "America/Los_Angeles", sections: [], amenities: [] } },
  { id: "lac", name: "Chargers", abbreviation: "LAC", displayName: "Los Angeles Chargers", shortDisplayName: "Chargers", location: "Los Angeles", color: "#0080C6", alternateColor: "#FFC20E", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", conference: "AFC", division: "West", stadium: { id: "sofi", name: "SoFi Stadium", city: "Inglewood", state: "CA", country: "USA", capacity: 70240, surface: "FieldTurf", roofType: "Dome", latitude: 33.9535, longitude: -118.3392, timezone: "America/Los_Angeles", sections: [], amenities: [] } },
  // NFC East
  { id: "dal", name: "Cowboys", abbreviation: "DAL", displayName: "Dallas Cowboys", shortDisplayName: "Cowboys", location: "Dallas", color: "#003594", alternateColor: "#869397", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png", conference: "NFC", division: "East", stadium: { id: "att", name: "AT&T Stadium", city: "Arlington", state: "TX", country: "USA", capacity: 80000, surface: "Matrix RealGrass", roofType: "Retractable", latitude: 32.7473, longitude: -97.0945, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "nyg", name: "Giants", abbreviation: "NYG", displayName: "New York Giants", shortDisplayName: "Giants", location: "New York", color: "#0B2265", alternateColor: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", conference: "NFC", division: "East", stadium: { id: "metlife", name: "MetLife Stadium", city: "East Rutherford", state: "NJ", country: "USA", capacity: 82500, surface: "FieldTurf", roofType: "Open", latitude: 40.8135, longitude: -74.0745, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "phi", name: "Eagles", abbreviation: "PHI", displayName: "Philadelphia Eagles", shortDisplayName: "Eagles", location: "Philadelphia", color: "#004C54", alternateColor: "#A5ACAF", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png", conference: "NFC", division: "East", stadium: { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", state: "PA", country: "USA", capacity: 69796, surface: "Grass", roofType: "Open", latitude: 39.9008, longitude: -75.1675, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "wsh", name: "Commanders", abbreviation: "WSH", displayName: "Washington Commanders", shortDisplayName: "Commanders", location: "Washington", color: "#5A1414", alternateColor: "#FFB612", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png", conference: "NFC", division: "East", stadium: { id: "fedex", name: "FedExField", city: "Landover", state: "MD", country: "USA", capacity: 67617, surface: "Grass", roofType: "Open", latitude: 38.9076, longitude: -76.8645, timezone: "America/New_York", sections: [], amenities: [] } },
  // NFC North
  { id: "chi", name: "Bears", abbreviation: "CHI", displayName: "Chicago Bears", shortDisplayName: "Bears", location: "Chicago", color: "#0B162A", alternateColor: "#C83803", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png", conference: "NFC", division: "North", stadium: { id: "soldier", name: "Soldier Field", city: "Chicago", state: "IL", country: "USA", capacity: 61500, surface: "Grass", roofType: "Open", latitude: 41.8623, longitude: -87.6167, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "det", name: "Lions", abbreviation: "DET", displayName: "Detroit Lions", shortDisplayName: "Lions", location: "Detroit", color: "#0076B6", alternateColor: "#B0B7BC", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", conference: "NFC", division: "North", stadium: { id: "ford", name: "Ford Field", city: "Detroit", state: "MI", country: "USA", capacity: 65000, surface: "FieldTurf", roofType: "Dome", latitude: 42.34, longitude: -83.0456, timezone: "America/Detroit", sections: [], amenities: [] } },
  { id: "gb", name: "Packers", abbreviation: "GB", displayName: "Green Bay Packers", shortDisplayName: "Packers", location: "Green Bay", color: "#203731", alternateColor: "#FFB612", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", conference: "NFC", division: "North", stadium: { id: "lambeau", name: "Lambeau Field", city: "Green Bay", state: "WI", country: "USA", capacity: 81441, surface: "Grass", roofType: "Open", latitude: 44.5013, longitude: -88.0622, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "min", name: "Vikings", abbreviation: "MIN", displayName: "Minnesota Vikings", shortDisplayName: "Vikings", location: "Minnesota", color: "#4F2683", alternateColor: "#FFC62F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", conference: "NFC", division: "North", stadium: { id: "usbank", name: "U.S. Bank Stadium", city: "Minneapolis", state: "MN", country: "USA", capacity: 66860, surface: "FieldTurf", roofType: "Dome", latitude: 44.9738, longitude: -93.2575, timezone: "America/Chicago", sections: [], amenities: [] } },
  // NFC South
  { id: "atl", name: "Falcons", abbreviation: "ATL", displayName: "Atlanta Falcons", shortDisplayName: "Falcons", location: "Atlanta", color: "#A71930", alternateColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png", conference: "NFC", division: "South", stadium: { id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", country: "USA", capacity: 71000, surface: "FieldTurf", roofType: "Retractable", latitude: 33.7553, longitude: -84.401, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "car", name: "Panthers", abbreviation: "CAR", displayName: "Carolina Panthers", shortDisplayName: "Panthers", location: "Carolina", color: "#0085CA", alternateColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", conference: "NFC", division: "South", stadium: { id: "boa", name: "Bank of America Stadium", city: "Charlotte", state: "NC", country: "USA", capacity: 75523, surface: "Grass", roofType: "Open", latitude: 35.2258, longitude: -80.8528, timezone: "America/New_York", sections: [], amenities: [] } },
  { id: "no", name: "Saints", abbreviation: "NO", displayName: "New Orleans Saints", shortDisplayName: "Saints", location: "New Orleans", color: "#D3BC8D", alternateColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png", conference: "NFC", division: "South", stadium: { id: "superdome", name: "Caesars Superdome", city: "New Orleans", state: "LA", country: "USA", capacity: 73208, surface: "FieldTurf", roofType: "Dome", latitude: 29.951, longitude: -90.0811, timezone: "America/Chicago", sections: [], amenities: [] } },
  { id: "tb", name: "Buccaneers", abbreviation: "TB", displayName: "Tampa Bay Buccaneers", shortDisplayName: "Buccaneers", location: "Tampa Bay", color: "#D50A0A", alternateColor: "#34302B", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png", conference: "NFC", division: "South", stadium: { id: "raymond", name: "Raymond James Stadium", city: "Tampa", state: "FL", country: "USA", capacity: 69218, surface: "Grass", roofType: "Open", latitude: 27.9759, longitude: -82.5033, timezone: "America/New_York", sections: [], amenities: [] } },
  // NFC West
  { id: "ari", name: "Cardinals", abbreviation: "ARI", displayName: "Arizona Cardinals", shortDisplayName: "Cardinals", location: "Arizona", color: "#97233F", alternateColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png", conference: "NFC", division: "West", stadium: { id: "statefarm", name: "State Farm Stadium", city: "Glendale", state: "AZ", country: "USA", capacity: 63400, surface: "Grass", roofType: "Retractable", latitude: 33.5276, longitude: -112.2626, timezone: "America/Phoenix", sections: [], amenities: [] } },
  { id: "lar", name: "Rams", abbreviation: "LAR", displayName: "Los Angeles Rams", shortDisplayName: "Rams", location: "Los Angeles", color: "#003594", alternateColor: "#FFA300", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", conference: "NFC", division: "West", stadium: { id: "sofi", name: "SoFi Stadium", city: "Inglewood", state: "CA", country: "USA", capacity: 70240, surface: "FieldTurf", roofType: "Dome", latitude: 33.9535, longitude: -118.3392, timezone: "America/Los_Angeles", sections: [], amenities: [] } },
  { id: "sf", name: "49ers", abbreviation: "SF", displayName: "San Francisco 49ers", shortDisplayName: "49ers", location: "San Francisco", color: "#AA0000", alternateColor: "#B3995D", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png", conference: "NFC", division: "West", stadium: { id: "levis", name: "Levi's Stadium", city: "Santa Clara", state: "CA", country: "USA", capacity: 68500, surface: "Grass", roofType: "Open", latitude: 37.4033, longitude: -121.9695, timezone: "America/Los_Angeles", sections: [], amenities: [] } },
  { id: "sea", name: "Seahawks", abbreviation: "SEA", displayName: "Seattle Seahawks", shortDisplayName: "Seahawks", location: "Seattle", color: "#002244", alternateColor: "#69BE28", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", conference: "NFC", division: "West", stadium: { id: "lumen", name: "Lumen Field", city: "Seattle", state: "WA", country: "USA", capacity: 68740, surface: "FieldTurf", roofType: "Open", latitude: 47.5952, longitude: -122.3316, timezone: "America/Los_Angeles", sections: [], amenities: [] } },
];

// Helper to get team by ID
function getTeam(id: string): NFLTeam | undefined {
  return NFL_TEAMS_DATA.find(t => t.id === id || t.abbreviation.toLowerCase() === id.toLowerCase());
}

// Generate mock games data
export function generateGames(): NFLGame[] {
  const teams = [...NFL_TEAMS_DATA];
  const games: NFLGame[] = [];
  
  // Create some live games
  const liveMatchups = [
    { home: "kc", away: "buf" },
    { home: "dal", away: "phi" },
  ];
  
  liveMatchups.forEach((matchup, i) => {
    const homeTeam = getTeam(matchup.home)!;
    const awayTeam = getTeam(matchup.away)!;
    
    games.push({
      id: `live-${i}`,
      date: new Date().toISOString(),
      time: "1:00 PM ET",
      status: "in_progress",
      homeTeam: { ...homeTeam, record: { wins: 10, losses: 3, ties: 0, winPercentage: 0.769, conferenceRecord: "7-2", divisionRecord: "4-1", homeRecord: "6-1", awayRecord: "4-2", streak: "W4", pointsFor: 384, pointsAgainst: 280 } },
      awayTeam: { ...awayTeam, record: { wins: 9, losses: 4, ties: 0, winPercentage: 0.692, conferenceRecord: "6-3", divisionRecord: "3-2", homeRecord: "5-2", awayRecord: "4-2", streak: "W2", pointsFor: 356, pointsAgainst: 298 } },
      homeScore: 21 + Math.floor(Math.random() * 14),
      awayScore: 17 + Math.floor(Math.random() * 14),
      quarter: 3,
      timeRemaining: `${Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      possession: Math.random() > 0.5 ? matchup.home : matchup.away,
      down: Math.floor(Math.random() * 4) + 1,
      distance: Math.floor(Math.random() * 10) + 1,
      yardLine: Math.floor(Math.random() * 50) + 25,
      redZone: Math.random() > 0.7,
      broadcasts: [
        { network: "CBS", type: "tv" },
        { network: "NFL Radio", type: "radio" },
      ],
      venue: homeTeam.stadium.name,
    });
  });
  
  // Create upcoming games
  const upcomingMatchups = [
    { home: "sf", away: "sea", time: "4:25 PM ET" },
    { home: "det", away: "gb", time: "8:20 PM ET" },
    { home: "bal", away: "pit", time: "1:00 PM ET" },
    { home: "mia", away: "nyj", time: "1:00 PM ET" },
    { home: "chi", away: "min", time: "1:00 PM ET" },
    { home: "lar", away: "ari", time: "4:05 PM ET" },
  ];
  
  upcomingMatchups.forEach((matchup, i) => {
    const homeTeam = getTeam(matchup.home)!;
    const awayTeam = getTeam(matchup.away)!;
    const gameDate = new Date();
    gameDate.setDate(gameDate.getDate() + 1);
    
    games.push({
      id: `upcoming-${i}`,
      date: gameDate.toISOString(),
      time: matchup.time,
      status: "scheduled",
      homeTeam: { ...homeTeam, record: { wins: 8, losses: 5, ties: 0, winPercentage: 0.615, conferenceRecord: "5-4", divisionRecord: "3-2", homeRecord: "5-2", awayRecord: "3-3", streak: "L1", pointsFor: 320, pointsAgainst: 290 } },
      awayTeam: { ...awayTeam, record: { wins: 7, losses: 6, ties: 0, winPercentage: 0.538, conferenceRecord: "5-4", divisionRecord: "2-3", homeRecord: "4-3", awayRecord: "3-3", streak: "W1", pointsFor: 305, pointsAgainst: 310 } },
      homeScore: 0,
      awayScore: 0,
      quarter: 0,
      timeRemaining: "",
      possession: "",
      down: 0,
      distance: 0,
      yardLine: 0,
      redZone: false,
      broadcasts: [
        { network: i < 2 ? "FOX" : "CBS", type: "tv" },
      ],
      venue: homeTeam.stadium.name,
    });
  });
  
  // Create some final games
  const finalMatchups = [
    { home: "ne", away: "nyg", homeScore: 24, awayScore: 21 },
    { home: "atl", away: "tb", homeScore: 17, awayScore: 31 },
    { home: "cin", away: "cle", homeScore: 28, awayScore: 24 },
  ];
  
  finalMatchups.forEach((matchup, i) => {
    const homeTeam = getTeam(matchup.home)!;
    const awayTeam = getTeam(matchup.away)!;
    const gameDate = new Date();
    gameDate.setDate(gameDate.getDate() - 1);
    
    games.push({
      id: `final-${i}`,
      date: gameDate.toISOString(),
      time: "1:00 PM ET",
      status: "final",
      homeTeam: { ...homeTeam, record: { wins: 6, losses: 7, ties: 0, winPercentage: 0.462, conferenceRecord: "4-5", divisionRecord: "2-3", homeRecord: "4-3", awayRecord: "2-4", streak: "W1", pointsFor: 280, pointsAgainst: 305 } },
      awayTeam: { ...awayTeam, record: { wins: 5, losses: 8, ties: 0, winPercentage: 0.385, conferenceRecord: "3-6", divisionRecord: "1-4", homeRecord: "3-4", awayRecord: "2-4", streak: "L2", pointsFor: 265, pointsAgainst: 320 } },
      homeScore: matchup.homeScore,
      awayScore: matchup.awayScore,
      quarter: 4,
      timeRemaining: "FINAL",
      possession: "",
      down: 0,
      distance: 0,
      yardLine: 0,
      redZone: false,
      broadcasts: [
        { network: "CBS", type: "tv" },
      ],
      venue: homeTeam.stadium.name,
    });
  });
  
  return games;
}

// Generate mock news data
export function generateNews(): NFLNews[] {
  return [
    {
      id: "1",
      headline: "Chiefs Continue Dominant Run with Victory Over Raiders",
      description: "Patrick Mahomes throws for 300+ yards as Kansas City extends winning streak to six games, solidifying their position as AFC favorites.",
      published: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      source: "ESPN",
      author: "Adam Schefter",
      imageUrl: "https://a.espncdn.com/photo/2024/0101/r1271889_1296x729_16-9.jpg",
      categories: ["Game Recap", "AFC West"],
      teams: ["kc", "lv"],
      premium: false,
      sentiment: "positive",
    },
    {
      id: "2",
      headline: "Injury Report: Star Quarterback Questionable for Sunday",
      description: "Multiple teams dealing with key injuries heading into crucial Week 15 matchups. Here's the latest on who's in and who's out.",
      published: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      source: "NFL Network",
      imageUrl: "https://a.espncdn.com/photo/2024/0101/r1271890_1296x729_16-9.jpg",
      categories: ["Injuries", "Analysis"],
      teams: [],
      premium: false,
      sentiment: "negative",
    },
    {
      id: "3",
      headline: "Trade Deadline Preview: Which Teams Are Buyers?",
      description: "As the trade deadline approaches, several contenders are looking to add pieces for a playoff push. We break down the top candidates.",
      published: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      source: "The Athletic",
      author: "Mike Sando",
      categories: ["Trade Rumors", "Analysis"],
      teams: [],
      premium: true,
      sentiment: "neutral",
    },
    {
      id: "4",
      headline: "Rookie of the Year Race Heats Up",
      description: "Three standout first-year players are making their case for the top rookie honor. Who's currently leading the pack?",
      published: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      source: "CBS Sports",
      imageUrl: "https://a.espncdn.com/photo/2024/0101/r1271891_1296x729_16-9.jpg",
      categories: ["Rookies", "Awards"],
      teams: [],
      premium: false,
      sentiment: "positive",
    },
    {
      id: "5",
      headline: "NFC Playoff Picture: Who's In, Who's Out",
      description: "With just a few weeks remaining in the regular season, the NFC playoff race is tighter than ever. Here's where each team stands.",
      published: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      source: "Fox Sports",
      categories: ["Playoffs", "NFC"],
      teams: [],
      premium: false,
      sentiment: "neutral",
    },
  ];
}

// Generate mock standings
export function generateStandings(): Record<string, StandingsEntry[]> {
  const divisions = [
    { conference: "AFC" as const, division: "East" as const },
    { conference: "AFC" as const, division: "North" as const },
    { conference: "AFC" as const, division: "South" as const },
    { conference: "AFC" as const, division: "West" as const },
    { conference: "NFC" as const, division: "East" as const },
    { conference: "NFC" as const, division: "North" as const },
    { conference: "NFC" as const, division: "South" as const },
    { conference: "NFC" as const, division: "West" as const },
  ];
  
  const standings: Record<string, StandingsEntry[]> = {};
  
  divisions.forEach((div) => {
    const divisionTeams = NFL_TEAMS_DATA.filter(t => t.conference === div.conference && t.division === div.division);
    const divisionKey = `${div.conference} ${div.division}`;
    
    standings[divisionKey] = divisionTeams.map((team, index) => {
      const wins = Math.floor(Math.random() * 10) + 4;
      const losses = 14 - wins;
      const ties = 0;
      const pointsFor = Math.floor(Math.random() * 150) + 280;
      const pointsAgainst = Math.floor(Math.random() * 150) + 260;
      
      return {
        team: {
          ...team,
          record: {
            wins,
            losses,
            ties,
            winPercentage: wins / (wins + losses),
            conferenceRecord: `${Math.floor(wins * 0.6)}-${Math.floor(losses * 0.6)}`,
            divisionRecord: `${Math.floor(wins * 0.35)}-${Math.floor(losses * 0.35)}`,
            homeRecord: `${Math.floor(wins * 0.55)}-${Math.floor(losses * 0.45)}`,
            awayRecord: `${Math.floor(wins * 0.45)}-${Math.floor(losses * 0.55)}`,
            streak: Math.random() > 0.5 ? `W${Math.floor(Math.random() * 4) + 1}` : `L${Math.floor(Math.random() * 3) + 1}`,
            pointsFor,
            pointsAgainst,
          },
        },
        rank: index + 1,
        wins,
        losses,
        ties,
        winPercentage: wins / (wins + losses),
        conferenceWins: Math.floor(wins * 0.6),
        conferenceLosses: Math.floor(losses * 0.6),
        divisionWins: Math.floor(wins * 0.35),
        divisionLosses: Math.floor(losses * 0.35),
        homeWins: Math.floor(wins * 0.55),
        homeLosses: Math.floor(losses * 0.45),
        awayWins: Math.floor(wins * 0.45),
        awayLosses: Math.floor(losses * 0.55),
        pointsFor,
        pointsAgainst,
        pointDifferential: pointsFor - pointsAgainst,
        streak: Math.random() > 0.5 ? `W${Math.floor(Math.random() * 4) + 1}` : `L${Math.floor(Math.random() * 3) + 1}`,
        last5: `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 3)}`,
        clinched: index === 0 && Math.random() > 0.6 ? "division" : undefined,
        playoffSeed: index + 1,
      };
    }).sort((a, b) => b.winPercentage - a.winPercentage);
  });
  
  return standings;
}

// Generate mock ticket listings
export function generateTicketListings(gameId?: string): TicketListing[] {
  const brokers = ["ticketmaster", "stubhub", "seatgeek"] as const;
  const listings: TicketListing[] = [];
  
  for (let i = 0; i < 12; i++) {
    const broker = brokers[Math.floor(Math.random() * brokers.length)];
    const price = Math.floor(Math.random() * 400) + 50;
    const fees = Math.floor(price * 0.18);
    
    listings.push({
      id: `ticket-${i}`,
      gameId: gameId || "game-1",
      broker,
      section: String(100 + Math.floor(Math.random() * 300)),
      row: String.fromCharCode(65 + Math.floor(Math.random() * 15)),
      seats: Math.floor(Math.random() * 4) + 1,
      price,
      currency: "USD",
      fees,
      totalPrice: price + fees,
      rating: 3.5 + Math.random() * 1.5,
      deliveryType: Math.random() > 0.3 ? "mobile" : "electronic",
      available: Math.random() > 0.1,
      url: "#",
    });
  }
  
  return listings.sort((a, b) => a.price - b.price);
}

// Generate mock plays for play-by-play
export function generatePlays(gameId: string): Play[] {
  const playTypes = ["rush", "pass", "punt", "timeout", "penalty"] as const;
  const plays: Play[] = [];
  
  for (let i = 0; i < 20; i++) {
    const type = playTypes[Math.floor(Math.random() * playTypes.length)];
    const yards = type === "rush" || type === "pass" ? Math.floor(Math.random() * 20) - 5 : 0;
    
    plays.push({
      id: `play-${i}`,
      gameId,
      quarter: Math.floor(i / 5) + 1,
      time: `${12 - (i % 5) * 2}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      down: Math.floor(Math.random() * 4) + 1,
      distance: Math.floor(Math.random() * 10) + 1,
      yardLine: Math.floor(Math.random() * 50) + 25,
      team: Math.random() > 0.5 ? "home" : "away",
      type,
      description: getPlayDescription(type, yards),
      yards,
      isScoring: type === "pass" && yards > 15 && Math.random() > 0.8,
      isTurnover: Math.random() > 0.95,
      isBigPlay: yards > 15,
      players: [
        { id: "p1", name: "J. Smith", position: "QB", team: "home", role: "passer" },
      ],
    });
  }
  
  return plays.reverse();
}

function getPlayDescription(type: string, yards: number): string {
  switch (type) {
    case "rush":
      return `Running back rushes up the middle for ${yards > 0 ? yards : "no"} yards.`;
    case "pass":
      return `Quarterback completes pass to the receiver for ${yards > 0 ? yards : "no"} yards.`;
    case "punt":
      return "Punter kicks it away, fair catch at the 25 yard line.";
    case "timeout":
      return "Timeout called by the offense.";
    case "penalty":
      return "False start on the offense, 5 yard penalty.";
    default:
      return "Play in progress.";
  }
}

export { NFL_TEAMS_DATA };
