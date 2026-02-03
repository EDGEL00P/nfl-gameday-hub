import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TeamHeader } from "@/components/team-header";
import { PlayerCard } from "@/components/player-card";
import { NewsCard } from "@/components/news-card";
import { StadiumMap } from "@/components/stadium-map";
import { getTeamById, NFL_TEAMS } from "@/lib/nfl-teams";
import { useFavoriteTeams } from "@/contexts/favorites-context";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Users, 
  Newspaper, 
  MapPin, 
  Radio, 
  Tv, 
  Ticket,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Home,
  Plane,
  Check,
  X,
  ChevronRight,
  Activity,
  Target
} from "lucide-react";
import type { NFLGame, NFLPlayer, NFLNews } from "@shared/schema";
import { motion } from "framer-motion";

// Mock data types
interface RecentGame {
  id: string;
  opponent: string;
  opponentLogo: string;
  result: "W" | "L" | "T";
  score: string;
  isHome: boolean;
  date: string;
}

interface InjuredPlayer {
  id: string;
  name: string;
  position: string;
  injury: string;
  status: "Out" | "Doubtful" | "Questionable" | "Probable";
}

interface ScheduleGame {
  id: string;
  week: number;
  date: string;
  time: string;
  opponent: string;
  opponentLogo: string;
  opponentColor: string;
  isHome: boolean;
  result?: "W" | "L" | "T";
  score?: string;
  isCompleted: boolean;
}

// Mock player data
function generateMockPlayers(teamId: string, teamColor: string): NFLPlayer[] {
  const positions = ["QB", "RB", "WR", "TE", "OT", "OG", "C", "DE", "DT", "LB", "CB", "S", "K", "P"];
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
  
  return names.map((name, i) => ({
    id: `${teamId}-${i}`,
    firstName: name.first,
    lastName: name.last,
    displayName: `${name.first} ${name.last}`,
    position: positions[i % positions.length],
    positionGroup: positions[i % positions.length],
    jersey: String((i + 1) * 10 + Math.floor(Math.random() * 9)),
    team: teamId,
    teamId,
    height: `6'${1 + Math.floor(Math.random() * 5)}"`,
    weight: 200 + Math.floor(Math.random() * 100),
    age: 22 + Math.floor(Math.random() * 12),
    college: ["Alabama", "Ohio State", "Georgia", "LSU", "Michigan", "Clemson", "Texas"][Math.floor(Math.random() * 7)],
    experience: 1 + Math.floor(Math.random() * 10),
    status: Math.random() > 0.85 ? "questionable" : "active",
    headshot: undefined,
    stats: positions[i % positions.length] === "QB" ? {
      gamesPlayed: 14,
      passingYards: 3500 + Math.floor(Math.random() * 1000),
      passingTouchdowns: 25 + Math.floor(Math.random() * 10),
      interceptions: 5 + Math.floor(Math.random() * 5),
      qbRating: 95 + Math.random() * 15,
    } : positions[i % positions.length] === "RB" ? {
      gamesPlayed: 14,
      rushingYards: 800 + Math.floor(Math.random() * 500),
      rushingTouchdowns: 5 + Math.floor(Math.random() * 8),
    } : positions[i % positions.length] === "WR" ? {
      gamesPlayed: 14,
      receivingYards: 600 + Math.floor(Math.random() * 800),
      receivingTouchdowns: 4 + Math.floor(Math.random() * 8),
      receptions: 40 + Math.floor(Math.random() * 60),
    } : undefined,
    fantasyPoints: 50 + Math.random() * 200,
  }));
}

// Generate mock recent games
function generateRecentGames(teamId: string): RecentGame[] {
  const opponents = NFL_TEAMS.filter(t => t.id !== teamId).slice(0, 5);
  const results: ("W" | "L")[] = ["W", "W", "L", "W", "L"];
  
  return opponents.map((opponent, i) => ({
    id: `recent-${i}`,
    opponent: opponent.abbreviation,
    opponentLogo: opponent.logo,
    result: results[i],
    score: results[i] === "W" ? `${24 + Math.floor(Math.random() * 14)}-${10 + Math.floor(Math.random() * 10)}` : `${10 + Math.floor(Math.random() * 10)}-${24 + Math.floor(Math.random() * 14)}`,
    isHome: i % 2 === 0,
    date: `Week ${10 + i}`,
  }));
}

// Generate mock injured players
function generateInjuredPlayers(): InjuredPlayer[] {
  return [
    { id: "inj-1", name: "James Anderson", position: "RB", injury: "Hamstring", status: "Questionable" },
    { id: "inj-2", name: "Michael Torres", position: "CB", injury: "Knee", status: "Out" },
    { id: "inj-3", name: "David Lee", position: "WR", injury: "Ankle", status: "Probable" },
    { id: "inj-4", name: "Robert Wilson", position: "LB", injury: "Shoulder", status: "Doubtful" },
  ];
}

// Generate mock schedule
function generateSchedule(teamId: string): ScheduleGame[] {
  const opponents = NFL_TEAMS.filter(t => t.id !== teamId);
  const schedule: ScheduleGame[] = [];
  
  for (let week = 1; week <= 17; week++) {
    const opponent = opponents[week % opponents.length];
    const isCompleted = week <= 14;
    const isHome = week % 2 === 0;
    const didWin = Math.random() > 0.4;
    
    schedule.push({
      id: `schedule-${week}`,
      week,
      date: `Week ${week}`,
      time: "1:00 PM ET",
      opponent: opponent.displayName,
      opponentLogo: opponent.logo,
      opponentColor: opponent.color,
      isHome,
      result: isCompleted ? (didWin ? "W" : "L") : undefined,
      score: isCompleted ? (didWin ? `${24 + Math.floor(Math.random() * 14)}-${10 + Math.floor(Math.random() * 10)}` : `${10 + Math.floor(Math.random() * 10)}-${24 + Math.floor(Math.random() * 14)}`) : undefined,
      isCompleted,
    });
  }
  
  return schedule;
}

// Standings Snapshot Component
function StandingsSnapshot({ team, teamColor }: { team: any; teamColor: string }) {
  const conferenceRank = 3;
  const divisionRank = 1;
  const playoffSeed = 3;
  const clinched = "playoff";
  
  const getPlayoffStatusColor = () => {
    if (clinched === "division" || clinched === "bye") return "bg-green-500";
    if (clinched === "playoff") return "bg-blue-500";
    if (clinched === "eliminated") return "bg-red-500";
    return "bg-amber-500";
  };
  
  const getPlayoffStatusText = () => {
    if (clinched === "division") return "Clinched Division";
    if (clinched === "bye") return "Clinched Bye";
    if (clinched === "playoff") return "Clinched Playoff";
    if (clinched === "eliminated") return "Eliminated";
    return "In Playoff Hunt";
  };

  return (
    <Card className="hover-elevate" data-testid="standings-snapshot">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: teamColor }} />
          Standings Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{conferenceRank}</p>
            <p className="text-xs text-muted-foreground">{team.conference} Rank</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{divisionRank}</p>
            <p className="text-xs text-muted-foreground">{team.division} Rank</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>#{playoffSeed}</p>
            <p className="text-xs text-muted-foreground">Playoff Seed</p>
          </div>
        </div>
        <Badge className={cn("w-full justify-center text-white", getPlayoffStatusColor())}>
          <Target className="h-3 w-3 mr-1" />
          {getPlayoffStatusText()}
        </Badge>
      </CardContent>
    </Card>
  );
}

// Recent Form Component
function RecentForm({ teamId, teamColor }: { teamId: string; teamColor: string }) {
  const recentGames = generateRecentGames(teamId);
  const wins = recentGames.filter(g => g.result === "W").length;
  const winPercentage = (wins / recentGames.length) * 100;
  
  return (
    <Card className="hover-elevate" data-testid="recent-form">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: teamColor }} />
          Recent Form (Last 5)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-2 mb-4">
          {recentGames.map((game, i) => (
            <div 
              key={game.id} 
              className="flex flex-col items-center gap-1"
              data-testid={`recent-game-${i}`}
            >
              <Badge 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                  game.result === "W" ? "bg-green-500" : game.result === "L" ? "bg-red-500" : "bg-gray-500"
                )}
              >
                {game.result}
              </Badge>
              <img 
                src={game.opponentLogo} 
                alt={game.opponent}
                className="w-6 h-6 object-contain"
                loading="lazy"
              />
              <span className="text-[10px] text-muted-foreground">{game.score}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-semibold">{winPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: teamColor }}
              initial={{ width: 0 }}
              animate={{ width: `${winPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Injury Report Component
function InjuryReport({ teamColor }: { teamColor: string }) {
  const injuredPlayers = generateInjuredPlayers();
  
  const getStatusColor = (status: InjuredPlayer["status"]) => {
    switch (status) {
      case "Out": return "bg-red-500 text-white";
      case "Doubtful": return "bg-orange-500 text-white";
      case "Questionable": return "bg-amber-500 text-white";
      case "Probable": return "bg-green-500 text-white";
    }
  };
  
  const getStatusIcon = (status: InjuredPlayer["status"]) => {
    switch (status) {
      case "Out": return <X className="h-3 w-3" />;
      case "Doubtful": return <AlertCircle className="h-3 w-3" />;
      case "Questionable": return <AlertCircle className="h-3 w-3" />;
      case "Probable": return <Check className="h-3 w-3" />;
    }
  };

  return (
    <Card className="hover-elevate" data-testid="injury-report">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" style={{ color: teamColor }} />
          Injury Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        {injuredPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No injuries reported
          </p>
        ) : (
          <div className="space-y-2">
            {injuredPlayers.map((player) => (
              <div 
                key={player.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                data-testid={`injured-player-${player.id}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {player.position}
                  </Badge>
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{player.injury}</span>
                  <Badge className={cn("text-[10px] gap-0.5", getStatusColor(player.status))}>
                    {getStatusIcon(player.status)}
                    {player.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced Schedule Component
function EnhancedSchedule({ teamId, teamColor }: { teamId: string; teamColor: string }) {
  const schedule = generateSchedule(teamId);
  const upcomingGames = schedule.filter(g => !g.isCompleted).slice(0, 4);
  const pastGames = schedule.filter(g => g.isCompleted).slice(-4).reverse();
  
  return (
    <div className="space-y-6">
      <Card data-testid="past-games">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: teamColor }} />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastGames.map((game) => (
              <div 
                key={game.id}
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                data-testid={`past-game-${game.id}`}
              >
                <Badge 
                  className={cn(
                    "w-8 text-white font-bold",
                    game.result === "W" ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  {game.result}
                </Badge>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: game.opponentColor + "20" }}
                >
                  <img src={game.opponentLogo} alt="" className="w-6 h-6 object-contain" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {game.isHome ? "vs" : "@"} {game.opponent}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {game.isHome ? <Home className="h-3 w-3" /> : <Plane className="h-3 w-3" />}
                    <span>{game.date}</span>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">{game.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="upcoming-games">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: teamColor }} />
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingGames.map((game) => (
              <div 
                key={game.id}
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                data-testid={`upcoming-game-${game.id}`}
              >
                <Badge 
                  variant="secondary"
                  className="w-8 font-bold"
                >
                  W{game.week}
                </Badge>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: game.opponentColor + "20" }}
                >
                  <img src={game.opponentLogo} alt="" className="w-6 h-6 object-contain" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {game.isHome ? "vs" : "@"} {game.opponent}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {game.isHome ? <Home className="h-3 w-3" /> : <Plane className="h-3 w-3" />}
                    <span>{game.time}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamDetail() {
  const params = useParams();
  const teamId = params.id as string;
  const { isFavoriteTeam, toggleFavoriteTeam } = useFavoriteTeams();
  
  const team = getTeamById(teamId);
  
  // Add mock record to team
  const teamWithRecord = team ? {
    ...team,
    record: {
      wins: 10,
      losses: 4,
      ties: 0,
      winPercentage: 0.714,
      conferenceRecord: "7-3",
      divisionRecord: "4-1",
      homeRecord: "6-1",
      awayRecord: "4-3",
      streak: "W3",
      pointsFor: 384,
      pointsAgainst: 298,
    },
  } : null;

  const { data: news = [] } = useQuery<NFLNews[]>({
    queryKey: ["/api/teams", teamId, "news"],
    enabled: !!team,
  });

  const mockPlayers = team ? generateMockPlayers(team.id, team.color) : [];

  if (!team || !teamWithRecord) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Team not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Team Header */}
      <TeamHeader 
        team={teamWithRecord}
        isFavorite={isFavoriteTeam(teamId)}
        onToggleFavorite={() => toggleFavoriteTeam(teamId)}
      />

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StandingsSnapshot team={team} teamColor={team.color} />
        <RecentForm teamId={teamId} teamColor={team.color} />
        <InjuryReport teamColor={team.color} />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="schedule" className="gap-1" data-testid="tab-schedule">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="roster" className="gap-1" data-testid="tab-roster">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Roster</span>
          </TabsTrigger>
          <TabsTrigger value="stadium" className="gap-1" data-testid="tab-stadium">
            <MapPin className="h-3 w-3" />
            <span className="hidden sm:inline">Stadium</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-1" data-testid="tab-news">
            <Newspaper className="h-3 w-3" />
            <span className="hidden sm:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1" data-testid="tab-tickets">
            <Ticket className="h-3 w-3" />
            <span className="hidden sm:inline">Tickets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <EnhancedSchedule teamId={teamId} teamColor={team.color} />
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/player/${player.id}`}>
                  <PlayerCard player={player} teamColor={team.color} />
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stadium" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <StadiumMap stadium={team.stadium} teamColor={team.color} />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stadium Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{team.stadium.city}, {team.stadium.state}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-medium">{team.stadium.capacity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Surface</p>
                      <p className="font-medium">{team.stadium.surface}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Roof Type</p>
                      <p className="font-medium">{team.stadium.roofType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    Broadcast Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-muted-foreground" />
                    Local TV: Check local listings
                  </p>
                  <p className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    Radio: Team Radio Network
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {news.length > 0 ? (
              news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))
            ) : (
              <Card className="md:col-span-2 p-8 text-center text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No news available</p>
                <p className="text-sm mt-1">Check back for the latest team updates</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <Card className="p-8 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-bold mb-2">Get Tickets</h3>
            <p className="text-muted-foreground mb-4">
              Find tickets to {team.displayName} games from verified brokers
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a 
                href="#" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover-elevate transition-colors"
                data-testid="link-ticketmaster"
              >
                Ticketmaster
              </a>
              <a 
                href="#" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover-elevate transition-colors"
                data-testid="link-stubhub"
              >
                StubHub
              </a>
              <a 
                href="#" 
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover-elevate transition-colors"
                data-testid="link-seatgeek"
              >
                SeatGeek
              </a>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
