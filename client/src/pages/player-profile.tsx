import { useParams, Link } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamById, NFL_TEAMS } from "@/lib/nfl-teams";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft,
  User,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  GraduationCap,
  Ruler,
  Scale,
  Clock,
  Star,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

// Types
interface GameLogEntry {
  week: number;
  opponent: string;
  opponentLogo: string;
  result: "W" | "L";
  stats: Record<string, number>;
  isBestGame: boolean;
}

interface StatComparison {
  label: string;
  value: number;
  leagueAvg: number;
  previousSeason: number;
  unit?: string;
}

interface WeeklyTrend {
  week: number;
  value: number;
}

// Generate mock player data based on ID
function generatePlayerData(playerId: string) {
  const [teamId, playerIndex] = playerId.split("-");
  const team = getTeamById(teamId) || NFL_TEAMS[0];
  const positions = ["QB", "RB", "WR", "TE", "LB", "CB", "DE", "S"];
  const position = positions[parseInt(playerIndex) % positions.length];
  
  const names = [
    { first: "Patrick", last: "Williams" },
    { first: "Derrick", last: "Johnson" },
    { first: "Tyreek", last: "Smith" },
    { first: "Travis", last: "Brown" },
    { first: "Marcus", last: "Davis" },
    { first: "Chris", last: "Miller" },
    { first: "Aaron", last: "Wilson" },
    { first: "Josh", last: "Taylor" },
  ];
  
  const name = names[parseInt(playerIndex) % names.length];
  
  return {
    id: playerId,
    firstName: name.first,
    lastName: name.last,
    displayName: `${name.first} ${name.last}`,
    position,
    jersey: String((parseInt(playerIndex) + 1) * 10 + 2),
    team,
    height: `6'${2 + Math.floor(parseInt(playerIndex) % 4)}"`,
    weight: 210 + (parseInt(playerIndex) * 5) % 50,
    age: 24 + (parseInt(playerIndex) % 8),
    college: ["Alabama", "Ohio State", "Georgia", "LSU", "Michigan", "Clemson", "Texas", "USC"][parseInt(playerIndex) % 8],
    experience: 2 + (parseInt(playerIndex) % 8),
    birthdate: "1998-09-17",
    birthplace: "Tyler, Texas",
    draftInfo: "2020 - Round 1, Pick 15",
    status: "active",
  };
}

// Generate position-specific stats
function generateSeasonStats(position: string): StatComparison[] {
  switch (position) {
    case "QB":
      return [
        { label: "Passing Yards", value: 4200, leagueAvg: 3800, previousSeason: 3950, unit: "YDS" },
        { label: "Touchdowns", value: 32, leagueAvg: 24, previousSeason: 28, unit: "TD" },
        { label: "Interceptions", value: 8, leagueAvg: 12, previousSeason: 10, unit: "INT" },
        { label: "Completion %", value: 68.5, leagueAvg: 64.2, previousSeason: 66.1, unit: "%" },
        { label: "Passer Rating", value: 105.2, leagueAvg: 92.5, previousSeason: 98.4, unit: "" },
        { label: "Rushing Yards", value: 420, leagueAvg: 180, previousSeason: 380, unit: "YDS" },
      ];
    case "RB":
      return [
        { label: "Rushing Yards", value: 1280, leagueAvg: 850, previousSeason: 1150, unit: "YDS" },
        { label: "Rush TD", value: 12, leagueAvg: 7, previousSeason: 10, unit: "TD" },
        { label: "Yards/Carry", value: 5.2, leagueAvg: 4.3, previousSeason: 4.8, unit: "AVG" },
        { label: "Receptions", value: 52, leagueAvg: 35, previousSeason: 48, unit: "REC" },
        { label: "Receiving Yards", value: 420, leagueAvg: 280, previousSeason: 380, unit: "YDS" },
        { label: "Fumbles", value: 2, leagueAvg: 3, previousSeason: 1, unit: "" },
      ];
    case "WR":
      return [
        { label: "Receptions", value: 98, leagueAvg: 65, previousSeason: 88, unit: "REC" },
        { label: "Receiving Yards", value: 1350, leagueAvg: 850, previousSeason: 1180, unit: "YDS" },
        { label: "Touchdowns", value: 11, leagueAvg: 6, previousSeason: 9, unit: "TD" },
        { label: "Yards/Reception", value: 13.8, leagueAvg: 12.5, previousSeason: 13.2, unit: "AVG" },
        { label: "Targets", value: 142, leagueAvg: 95, previousSeason: 128, unit: "" },
        { label: "Catch %", value: 69.0, leagueAvg: 65.5, previousSeason: 68.2, unit: "%" },
      ];
    case "TE":
      return [
        { label: "Receptions", value: 72, leagueAvg: 48, previousSeason: 65, unit: "REC" },
        { label: "Receiving Yards", value: 850, leagueAvg: 580, previousSeason: 780, unit: "YDS" },
        { label: "Touchdowns", value: 8, leagueAvg: 5, previousSeason: 7, unit: "TD" },
        { label: "Yards/Reception", value: 11.8, leagueAvg: 10.5, previousSeason: 11.2, unit: "AVG" },
        { label: "Red Zone Targets", value: 24, leagueAvg: 15, previousSeason: 20, unit: "" },
        { label: "First Downs", value: 38, leagueAvg: 28, previousSeason: 34, unit: "" },
      ];
    default:
      return [
        { label: "Tackles", value: 98, leagueAvg: 72, previousSeason: 85, unit: "" },
        { label: "Sacks", value: 12.5, leagueAvg: 6, previousSeason: 10, unit: "" },
        { label: "Interceptions", value: 3, leagueAvg: 1.5, previousSeason: 2, unit: "" },
        { label: "Passes Defended", value: 14, leagueAvg: 8, previousSeason: 12, unit: "" },
        { label: "Forced Fumbles", value: 4, leagueAvg: 2, previousSeason: 3, unit: "" },
        { label: "QB Hits", value: 22, leagueAvg: 12, previousSeason: 18, unit: "" },
      ];
  }
}

// Generate game log
function generateGameLog(position: string): GameLogEntry[] {
  const opponents = NFL_TEAMS.slice(0, 14);
  
  const getStatKeys = () => {
    switch (position) {
      case "QB": return ["passYds", "passTD", "int", "rushYds"];
      case "RB": return ["rushYds", "rushTD", "rec", "recYds"];
      case "WR": return ["rec", "recYds", "recTD", "targets"];
      case "TE": return ["rec", "recYds", "recTD", "targets"];
      default: return ["tackles", "sacks", "int", "pd"];
    }
  };
  
  const statKeys = getStatKeys();
  const entries: GameLogEntry[] = [];
  let bestGameValue = 0;
  let bestGameIndex = 0;
  
  for (let week = 1; week <= 14; week++) {
    const opponent = opponents[(week - 1) % opponents.length];
    const stats: Record<string, number> = {};
    let primaryValue = 0;
    
    statKeys.forEach((key, idx) => {
      let value: number;
      if (position === "QB" && key === "passYds") {
        value = 180 + Math.floor(Math.random() * 200);
        primaryValue = value;
      } else if (position === "RB" && key === "rushYds") {
        value = 50 + Math.floor(Math.random() * 100);
        primaryValue = value;
      } else if ((position === "WR" || position === "TE") && key === "recYds") {
        value = 40 + Math.floor(Math.random() * 120);
        primaryValue = value;
      } else if (key.includes("TD")) {
        value = Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0;
      } else if (key === "int" && position === "QB") {
        value = Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0;
      } else if (key === "tackles") {
        value = 4 + Math.floor(Math.random() * 8);
        primaryValue = value;
      } else if (key === "sacks") {
        value = Math.random() > 0.5 ? Math.random() * 2 : 0;
        value = Math.round(value * 10) / 10;
      } else {
        value = Math.floor(Math.random() * 8);
      }
      stats[key] = value;
    });
    
    if (primaryValue > bestGameValue) {
      bestGameValue = primaryValue;
      bestGameIndex = week - 1;
    }
    
    entries.push({
      week,
      opponent: opponent.abbreviation,
      opponentLogo: opponent.logo,
      result: Math.random() > 0.4 ? "W" : "L",
      stats,
      isBestGame: false,
    });
  }
  
  if (entries[bestGameIndex]) {
    entries[bestGameIndex].isBestGame = true;
  }
  
  return entries;
}

// Generate weekly trends
function generateWeeklyTrends(position: string): WeeklyTrend[] {
  const trends: WeeklyTrend[] = [];
  let baseValue = position === "QB" ? 250 : position === "RB" ? 75 : 60;
  
  for (let week = 1; week <= 14; week++) {
    const variance = baseValue * 0.4;
    trends.push({
      week,
      value: Math.round(baseValue + (Math.random() - 0.5) * variance * 2),
    });
  }
  
  return trends;
}

// Stat Bar Component
function StatBar({ stat, teamColor }: { stat: StatComparison; teamColor: string }) {
  const maxValue = Math.max(stat.value, stat.leagueAvg, stat.previousSeason) * 1.2;
  const valuePercent = (stat.value / maxValue) * 100;
  const leaguePercent = (stat.leagueAvg / maxValue) * 100;
  const prevPercent = (stat.previousSeason / maxValue) * 100;
  
  const isAboveAvg = stat.value > stat.leagueAvg;
  const trend = stat.value > stat.previousSeason ? "up" : stat.value < stat.previousSeason ? "down" : "same";
  
  return (
    <div className="space-y-2" data-testid={`stat-bar-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{stat.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{stat.value}{stat.unit === "%" ? "%" : ""}</span>
          {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
          {trend === "same" && <Minus className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full rounded-full"
            style={{ backgroundColor: teamColor }}
            initial={{ width: 0 }}
            animate={{ width: `${valuePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            Avg: {stat.leagueAvg}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
            Last: {stat.previousSeason}
          </span>
        </div>
      </div>
    </div>
  );
}

// Trend Chart Component
function TrendChart({ trends, teamColor, label }: { trends: WeeklyTrend[]; teamColor: string; label: string }) {
  const maxValue = Math.max(...trends.map(t => t.value));
  const minValue = Math.min(...trends.map(t => t.value));
  const range = maxValue - minValue || 1;
  
  return (
    <Card className="hover-elevate" data-testid="trend-chart">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: teamColor }} />
          {label} Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-1 h-32">
          {trends.map((trend, i) => {
            const height = ((trend.value - minValue) / range) * 100;
            return (
              <div key={trend.week} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t"
                  style={{ 
                    backgroundColor: teamColor,
                    minHeight: 4,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  title={`Week ${trend.week}: ${trend.value}`}
                />
                <span className="text-[9px] text-muted-foreground">{trend.week}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Low: {minValue}</span>
          <span>High: {maxValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Game Log Table
function GameLogTable({ 
  gameLog, 
  position, 
  teamColor,
  sortColumn,
  sortDirection,
  onSort 
}: { 
  gameLog: GameLogEntry[]; 
  position: string;
  teamColor: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}) {
  const getColumnHeaders = () => {
    switch (position) {
      case "QB": return ["passYds", "passTD", "int", "rushYds"];
      case "RB": return ["rushYds", "rushTD", "rec", "recYds"];
      case "WR": return ["rec", "recYds", "recTD", "targets"];
      case "TE": return ["rec", "recYds", "recTD", "targets"];
      default: return ["tackles", "sacks", "int", "pd"];
    }
  };
  
  const getColumnLabel = (col: string) => {
    const labels: Record<string, string> = {
      passYds: "Pass YDS",
      passTD: "Pass TD",
      int: "INT",
      rushYds: "Rush YDS",
      rushTD: "Rush TD",
      rec: "REC",
      recYds: "Rec YDS",
      recTD: "Rec TD",
      targets: "TGT",
      tackles: "TKL",
      sacks: "SACK",
      pd: "PD",
    };
    return labels[col] || col;
  };
  
  const columns = getColumnHeaders();
  
  const sortedGameLog = [...gameLog].sort((a, b) => {
    if (sortColumn === "week") {
      return sortDirection === "asc" ? a.week - b.week : b.week - a.week;
    }
    const aVal = a.stats[sortColumn] || 0;
    const bVal = b.stats[sortColumn] || 0;
    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  return (
    <Card data-testid="game-log">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" style={{ color: teamColor }} />
          Game Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover-elevate"
                  onClick={() => onSort("week")}
                  data-testid="sort-week"
                >
                  <div className="flex items-center gap-1">
                    WK
                    {sortColumn === "week" && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead>OPP</TableHead>
                <TableHead>RES</TableHead>
                {columns.map(col => (
                  <TableHead 
                    key={col}
                    className="cursor-pointer hover-elevate text-right"
                    onClick={() => onSort(col)}
                    data-testid={`sort-${col}`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {getColumnLabel(col)}
                      {sortColumn === col && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGameLog.map((game) => (
                <TableRow 
                  key={game.week}
                  className={cn(game.isBestGame && "bg-amber-500/10")}
                  data-testid={`game-log-row-${game.week}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {game.week}
                      {game.isBestGame && <Star className="h-3 w-3 text-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <img src={game.opponentLogo} alt="" className="w-5 h-5 object-contain" />
                      <span className="text-xs">{game.opponent}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "text-[10px] text-white",
                        game.result === "W" ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      {game.result}
                    </Badge>
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col} className="text-right tabular-nums">
                      {game.stats[col]?.toFixed(col === "sacks" ? 1 : 0) || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlayerProfile() {
  const params = useParams();
  const playerId = params.id as string;
  const [sortColumn, setSortColumn] = useState("week");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const player = generatePlayerData(playerId);
  const seasonStats = generateSeasonStats(player.position);
  const gameLog = generateGameLog(player.position);
  const trends = generateWeeklyTrends(player.position);
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };
  
  const getPrimaryStatLabel = () => {
    switch (player.position) {
      case "QB": return "Passing Yards";
      case "RB": return "Rushing Yards";
      case "WR": case "TE": return "Receiving Yards";
      default: return "Tackles";
    }
  };

  if (!player.team) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="p-8 text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Player not found</p>
        </Card>
      </div>
    );
  }

  const teamColor = player.team.color;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        asChild
        data-testid="button-back"
      >
        <Link href={`/team/${player.team.id}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {player.team.displayName}
        </Link>
      </Button>

      {/* Player Header */}
      <Card 
        className="overflow-hidden"
        data-testid="player-header"
      >
        <div className="relative">
          {/* Header Banner */}
          <div
            className="h-24 md:h-32"
            style={{ background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}88 100%)` }}
          />
          
          {/* Player Photo & Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 md:px-6">
            <div className="flex items-end gap-4">
              {/* Photo */}
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-background shadow-lg flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: teamColor + "20", color: teamColor }}
              >
                {player.firstName.charAt(0)}{player.lastName.charAt(0)}
              </div>
              
              {/* Name & Position */}
              <div className="mb-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">{player.displayName}</h1>
                  <Badge style={{ backgroundColor: teamColor, color: "white" }}>
                    {player.position}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src={player.team.logo} 
                    alt={player.team.name}
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-muted-foreground">
                    {player.team.displayName} #{player.jersey}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Physical Stats */}
        <div className="pt-16 md:pt-20 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Ruler className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-semibold">{player.height}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Scale className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold">{player.weight} lbs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold">{player.age}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">College</p>
                <p className="font-semibold">{player.college}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-semibold">{player.experience} yrs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Draft</p>
                <p className="font-semibold text-xs">{player.draftInfo}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Tabs */}
      <Tabs defaultValue="season" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="season" className="gap-1" data-testid="tab-season-stats">
            <Activity className="h-3 w-3" />
            <span className="hidden sm:inline">Season Stats</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="gamelog" className="gap-1" data-testid="tab-game-log">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Game Log</span>
            <span className="sm:hidden">Games</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1" data-testid="tab-trends">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Stat Trends</span>
            <span className="sm:hidden">Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="season" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover-elevate" data-testid="season-stats">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" style={{ color: teamColor }} />
                  Season Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {seasonStats.slice(0, 3).map((stat) => (
                  <StatBar key={stat.label} stat={stat} teamColor={teamColor} />
                ))}
              </CardContent>
            </Card>
            
            <Card className="hover-elevate" data-testid="season-stats-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: teamColor }} />
                  Advanced Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {seasonStats.slice(3, 6).map((stat) => (
                  <StatBar key={stat.label} stat={stat} teamColor={teamColor} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamelog" className="mt-6">
          <GameLogTable 
            gameLog={gameLog}
            position={player.position}
            teamColor={teamColor}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart 
              trends={trends} 
              teamColor={teamColor}
              label={getPrimaryStatLabel()}
            />
            
            <Card className="hover-elevate" data-testid="performance-summary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: teamColor }} />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span className="text-sm">Best Game</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">
                        Week {gameLog.find(g => g.isBestGame)?.week || 1}
                      </Badge>
                      <span className="font-bold">
                        {Math.max(...trends.map(t => t.value))} yds
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">Season Average</span>
                    <span className="font-bold">
                      {Math.round(trends.reduce((a, b) => a + b.value, 0) / trends.length)} yds
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">Games Played</span>
                    <span className="font-bold">{gameLog.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">Win Rate</span>
                    <span className="font-bold">
                      {Math.round((gameLog.filter(g => g.result === "W").length / gameLog.length) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
