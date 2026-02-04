import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, TrendingUp, Calendar, MapPin, Shield, Target, 
  Activity, ArrowUpRight, ArrowDownRight, User, Shirt
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NFLPlayer, NFLTeam } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

function calculateFantasyPoints(stats: any): number {
  if (!stats) return 0;
  let points = 0;
  // Passing
  points += (stats.pass_yards || 0) / 25;
  points += (stats.pass_td || 0) * 4;
  points -= (stats.pass_int || 0) * 2;
  // Rushing
  points += (stats.rush_yards || 0) / 10;
  points += (stats.rush_td || 0) * 6;
  // Receiving
  points += (stats.rec_yards || 0) / 10;
  points += (stats.rec_td || 0) * 6;
  points += (stats.rec_receptions || 0) * 0.5; // Half PPR
  
  return parseFloat(points.toFixed(1));
}

export default function PlayerProfile() {
  const params = useParams();
  const playerId = params.id as string;

  // 1. Get Player Info
  const { data: players = [], isLoading: isLoadingPlayer } = useQuery<NFLPlayer[]>({ 
    queryKey: ["/api/players", { id: playerId }] 
  });
  const player = players[0];

  // 2. Get Team Info (for colors)
  const { data: teams = [] } = useQuery<NFLTeam[]>({ queryKey: ["/api/teams"] });
  const team = teams.find(t => t.id === player?.team.toLowerCase());
  const teamColor = team?.color || "#000000";

  // 3. Get Stats
  const { data: gameLogs = [] } = useQuery<any[]>({ 
    queryKey: ["/api/stats", { player_id: playerId }]
  });

  // Process stats
  const seasonStats = gameLogs.reduce((acc, game) => ({
    games: acc.games + 1,
    passYards: acc.passYards + (game.pass_yards || 0),
    passTd: acc.passTd + (game.pass_td || 0),
    rushYards: acc.rushYards + (game.rush_yards || 0),
    rushTd: acc.rushTd + (game.rush_td || 0),
    recYards: acc.recYards + (game.rec_yards || 0),
    recTd: acc.recTd + (game.rec_td || 0),
    receptions: acc.receptions + (game.rec_receptions || 0),
    fantasyPoints: acc.fantasyPoints + calculateFantasyPoints(game)
  }), { 
    games: 0, passYards: 0, passTd: 0, rushYards: 0, rushTd: 0, recYards: 0, recTd: 0, receptions: 0, fantasyPoints: 0 
  });

  // Prepare chart data (reverse to chronological)
  const chartData = [...gameLogs].reverse().map(game => ({
    week: `W${game.game?.week || '?'}`,
    points: calculateFantasyPoints(game),
    passing: game.pass_yards || 0,
    rushing: game.rush_yards || 0,
    receiving: game.rec_yards || 0,
  }));

  if (isLoadingPlayer) {
    return <div className="p-8 text-center">Loading player data...</div>;
  }

  if (!player) {
    return <div className="p-8 text-center">Player not found</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-muted">
        <div className="h-32 bg-primary/10" style={{ backgroundColor: `${teamColor}20` }}></div>
        <div className="px-6 pb-6 -mt-16 flex flex-col md:flex-row items-end gap-6">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarImage src={player.headshot} alt={player.displayName} />
            <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
              {player.firstName[0]}{player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1 bg-background/80 backdrop-blur">
                #{player.jersey}
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1 bg-background/80 backdrop-blur">
                {player.position}
              </Badge>
              {team && (
                <Link href={`/team/${team.id}`}>
                  <Badge className="text-lg px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: teamColor }}>
                    {team.name}
                  </Badge>
                </Link>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">{player.displayName}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" /> {player.height}, {player.weight} lbs
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {player.age} years old
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" /> {player.college || "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" /> {player.experience}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-2">
            <div className="text-center p-3 bg-background/50 backdrop-blur rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-bold">Games</p>
              <p className="text-2xl font-bold">{seasonStats.games}</p>
            </div>
            <div className="text-center p-3 bg-background/50 backdrop-blur rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-bold">Fantasy Pts</p>
              <p className="text-2xl font-bold" style={{ color: teamColor }}>{seasonStats.fantasyPoints.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gamelog">Game Log</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* dynamic stats cards based on position */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Passing Yards</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{seasonStats.passYards}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Passing TDs</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{seasonStats.passTd}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Rushing Yards</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{seasonStats.rushYards}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Receiving Yards</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{seasonStats.recYards}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fantasy Performance</CardTitle>
              <CardDescription>Points per game trend</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="points" stroke={teamColor} strokeWidth={2} dot={{ r: 4, fill: teamColor }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamelog">
          <Card>
            <CardHeader><CardTitle>Game Log</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                       <th className="p-2 text-left">Date</th>
                       <th className="p-2 text-right">Pass Yds</th>
                       <th className="p-2 text-right">Pass TD</th>
                       <th className="p-2 text-right">Rush Yds</th>
                       <th className="p-2 text-right">Rush TD</th>
                       <th className="p-2 text-right">Rec Yds</th>
                       <th className="p-2 text-right">Rec TD</th>
                       <th className="p-2 text-right">Fantasy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLogs.length === 0 ? (
                      <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No game data available</td></tr>
                    ) : (
                      gameLogs.map((game, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-2">{new Date(game.game?.date).toLocaleDateString()}</td>
                          <td className="p-2 text-right">{game.pass_yards || 0}</td>
                          <td className="p-2 text-right">{game.pass_td || 0}</td>
                          <td className="p-2 text-right">{game.rush_yards || 0}</td>
                          <td className="p-2 text-right">{game.rush_td || 0}</td>
                          <td className="p-2 text-right">{game.rec_yards || 0}</td>
                          <td className="p-2 text-right">{game.rec_td || 0}</td>
                          <td className="p-2 text-right font-medium">{calculateFantasyPoints(game)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader><CardTitle>Statistical Trends</CardTitle></CardHeader>
            <CardContent className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                  <Bar dataKey="passing" name="Passing Yds" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="rushing" name="Rushing Yds" fill="#22c55e" stackId="a" />
                  <Bar dataKey="receiving" name="Receiving Yds" fill="#eab308" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
