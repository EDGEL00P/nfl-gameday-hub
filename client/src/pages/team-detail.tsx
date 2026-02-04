import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TeamHeader } from "@/components/team-header";
import { PlayerCard } from "@/components/player-card";
import { NewsCard } from "@/components/news-card";
import { StadiumMap } from "@/components/stadium-map";
import { useFavoriteTeams } from "@/contexts/favorites-context";
import { cn } from "@/lib/utils";
import { 
  Calendar, Users, Newspaper, MapPin, Radio, Tv, Ticket, Trophy,
  TrendingUp, AlertCircle, Home, Plane, ChevronRight, Activity, Target, Check, X
} from "lucide-react";
import type { NFLGame, NFLPlayer, NFLNews, NFLTeam, StandingsEntry } from "@shared/schema";
import { motion } from "framer-motion";

// Helper to determine game result
function getGameResult(game: NFLGame, teamId: string): "W" | "L" | "T" | undefined {
  if (game.status !== 'final') return undefined;
  
  const isHome = game.homeTeam.id === teamId;
  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  
  if (teamScore > oppScore) return 'W';
  if (teamScore < oppScore) return 'L';
  return 'T';
}

function StandingsSnapshot({ entry, teamColor }: { entry?: StandingsEntry; teamColor: string }) {
  if (!entry) return null;

  const getPlayoffStatusColor = () => {
    if (entry.clinched === "division" || entry.clinched === "bye") return "bg-green-500";
    if (entry.clinched === "playoff") return "bg-blue-500";
    if (entry.clinched === "eliminated") return "bg-red-500";
    return "bg-amber-500";
  };
  
  const getPlayoffStatusText = () => {
    if (entry.clinched === "division") return "Clinched Division";
    if (entry.clinched === "bye") return "Clinched Bye";
    if (entry.clinched === "playoff") return "Clinched Playoff";
    if (entry.clinched === "eliminated") return "Eliminated";
    return "In Playoff Hunt";
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: teamColor }} />
          Standings Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{entry.rank}</p>
            <p className="text-xs text-muted-foreground">Div Rank</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>{entry.wins}-{entry.losses}</p>
            <p className="text-xs text-muted-foreground">Record</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: teamColor }}>#{entry.playoffSeed || '-'}</p>
            <p className="text-xs text-muted-foreground">Seed</p>
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

function RecentForm({ games, teamId, teamColor }: { games: NFLGame[]; teamId: string; teamColor: string }) {
  const completedGames = games.filter(g => g.status === 'final').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const wins = completedGames.filter(g => getGameResult(g, teamId) === 'W').length;
  const winPercentage = completedGames.length > 0 ? (wins / completedGames.length) * 100 : 0;
  
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: teamColor }} />
          Recent Form (Last 5)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-2 mb-4">
          {completedGames.map((game) => {
            const result = getGameResult(game, teamId) || '-';
            const isHome = game.homeTeam.id === teamId;
            const opponent = isHome ? game.awayTeam : game.homeTeam;
            
            return (
              <div key={game.id} className="flex flex-col items-center gap-1">
                <Badge className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                  result === "W" ? "bg-green-500" : result === "L" ? "bg-red-500" : "bg-gray-500"
                )}>
                  {result}
                </Badge>
                <img src={opponent.logo} alt={opponent.abbreviation} className="w-6 h-6 object-contain" />
              </div>
            );
          })}
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

function InjuryReport({ players, teamColor }: { players: NFLPlayer[]; teamColor: string }) {
  // Use real data: filter by status != active
  const injuredPlayers = players.filter(p => p.status && p.status.toLowerCase() !== 'active').slice(0, 5);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('out') || s.includes('ir') || s.includes('injured')) return "bg-red-500 text-white";
    if (s.includes('doubtful')) return "bg-orange-500 text-white";
    if (s.includes('questionable')) return "bg-amber-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" style={{ color: teamColor }} />
          Injury Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        {injuredPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No injuries reported</p>
        ) : (
          <div className="space-y-2">
            {injuredPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{player.position}</Badge>
                  <span className="text-sm font-medium">{player.displayName}</span>
                </div>
                <Badge className={cn("text-[10px]", getStatusColor(player.status))}>
                  {player.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EnhancedSchedule({ games, teamId, teamColor }: { games: NFLGame[]; teamId: string; teamColor: string }) {
  const sortedGames = [...games].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now = new Date();
  const pastGames = sortedGames.filter(g => new Date(g.date) < now).reverse().slice(0, 5);
  const upcomingGames = sortedGames.filter(g => new Date(g.date) >= now).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Past Games */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: teamColor }} />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastGames.map((game) => {
              const result = getGameResult(game, teamId);
              const isHome = game.homeTeam.id === teamId;
              const opponent = isHome ? game.awayTeam : game.homeTeam;
              return (
                <div key={game.id} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                  <Badge className={cn("w-8 text-white font-bold", result === "W" ? "bg-green-500" : "bg-red-500")}>
                    {result}
                  </Badge>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <img src={opponent.logo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isHome ? "vs" : "@"} {opponent.shortDisplayName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(game.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold">{game.awayScore}-{game.homeScore}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Games */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: teamColor }} />
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingGames.map((game) => {
              const isHome = game.homeTeam.id === teamId;
              const opponent = isHome ? game.awayTeam : game.homeTeam;
              return (
                <div key={game.id} className="flex items-center gap-3 p-2 rounded-lg hover-elevate">
                  <Badge variant="secondary" className="w-8 font-bold">VS</Badge>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <img src={opponent.logo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isHome ? "vs" : "@"} {opponent.shortDisplayName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(game.date).toLocaleDateString()} {game.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
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

  // 1. Fetch all teams to find current team info
  const { data: teams = [] } = useQuery<NFLTeam[]>({ queryKey: ["/api/teams"] });
  const team = teams.find(t => t.id === teamId);

  // 2. Fetch standings to find team entry
  const { data: standingsMap = {} } = useQuery<{ [key: string]: StandingsEntry[] }>({ queryKey: ["/api/standings"] });
  // Helper to find entry
  let standingsEntry: StandingsEntry | undefined;
  if (team) {
    const key = `${team.conference} ${team.division}`;
    standingsEntry = standingsMap[key]?.find(e => e.team.id === teamId);
  }

  // 3. Fetch players using apiId
  const { data: players = [] } = useQuery<NFLPlayer[]>({ 
    queryKey: ["/api/players", team?.apiId],
    enabled: !!team?.apiId 
  });

  // 4. Fetch schedule using apiId
  const { data: schedule = [] } = useQuery<NFLGame[]>({ 
    queryKey: ["/api/schedule", team?.apiId],
    enabled: !!team?.apiId 
  });

  // 5. Fetch news
  const { data: news = [] } = useQuery<NFLNews[]>({ queryKey: ["/api/news"] });
  const teamNews = news.filter(n => 
    n.description.toLowerCase().includes(team?.name.toLowerCase() || "") || 
    n.headline.toLowerCase().includes(team?.name.toLowerCase() || "")
  );

  if (!team) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Loading team data...</p>
        </Card>
      </div>
    );
  }

  // Merge record from standings into team object for header
  const teamWithRecord = standingsEntry ? { ...team, record: standingsEntry.team.record } : team;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <TeamHeader 
        team={teamWithRecord}
        isFavorite={isFavoriteTeam(teamId)}
        onToggleFavorite={() => toggleFavoriteTeam(teamId)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StandingsSnapshot entry={standingsEntry} teamColor={team.color} />
        <RecentForm games={schedule} teamId={teamId} teamColor={team.color} />
        <InjuryReport players={players} teamColor={team.color} />
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="schedule" className="gap-1"><Calendar className="h-3 w-3" /><span className="hidden sm:inline">Schedule</span></TabsTrigger>
          <TabsTrigger value="roster" className="gap-1"><Users className="h-3 w-3" /><span className="hidden sm:inline">Roster</span></TabsTrigger>
          <TabsTrigger value="stadium" className="gap-1"><MapPin className="h-3 w-3" /><span className="hidden sm:inline">Stadium</span></TabsTrigger>
          <TabsTrigger value="news" className="gap-1"><Newspaper className="h-3 w-3" /><span className="hidden sm:inline">News</span></TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1"><Ticket className="h-3 w-3" /><span className="hidden sm:inline">Tickets</span></TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <EnhancedSchedule games={schedule} teamId={teamId} teamColor={team.color} />
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {players.map((player, i) => (
              <motion.div key={player.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/player/${player.id}`}>
                  <PlayerCard player={player} teamColor={team.color} />
                </Link>
              </motion.div>
            ))}
            {players.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No roster data available.</p>}
          </div>
        </TabsContent>

        <TabsContent value="stadium" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <StadiumMap stadium={team.stadium} teamColor={team.color} />
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Stadium Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Location</p><p className="font-medium">{team.stadium.city}, {team.stadium.state}</p></div>
                    <div><p className="text-muted-foreground">Capacity</p><p className="font-medium">{team.stadium.capacity.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Surface</p><p className="font-medium">{team.stadium.surface}</p></div>
                    <div><p className="text-muted-foreground">Roof Type</p><p className="font-medium">{team.stadium.roofType}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Radio className="h-4 w-4" />Broadcast Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><Tv className="h-4 w-4 text-muted-foreground" />Local TV: Check listings</p>
                  <p className="flex items-center gap-2"><Radio className="h-4 w-4 text-muted-foreground" />Radio: Team Network</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {teamNews.length > 0 ? teamNews.map(item => <NewsCard key={item.id} news={item} />) : 
              <Card className="md:col-span-2 p-8 text-center text-muted-foreground"><p>No specific news for this team.</p></Card>}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <Card className="p-8 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-bold mb-2">Get Tickets</h3>
            <p className="text-muted-foreground mb-4">Find tickets to {team.displayName} games</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://www.ticketmaster.com/nfl" target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover-elevate">Ticketmaster</a>
              <a href="https://www.stubhub.com/nfl-tickets" target="_blank" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover-elevate">StubHub</a>
              <a href="https://seatgeek.com/nfl-football-tickets" target="_blank" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover-elevate">SeatGeek</a>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
