import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveIndicator } from "@/components/live-indicator";
import { AnimatedScore } from "@/components/animated-score";
import { FieldVisualization } from "@/components/field-visualization";
import { PlayByPlay } from "@/components/play-by-play";
import { DriveChart } from "@/components/drive-chart";
import { ScoringSummary } from "@/components/scoring-summary";
import { WinProbability } from "@/components/win-probability";
import { KeyPlayerStats } from "@/components/key-player-stats";
import { Helmet, Football, DownMarker } from "@/components/nfl-elements";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Activity, 
  BarChart3, 
  Users, 
  Tv, 
  Radio,
  MapPin,
  Clock,
  Calendar,
  Circle,
  Ticket,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import type { NFLGame, Play } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function GameCenter() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  
  const { games: wsGames, plays, isConnected, subscribeToGame, requestPlays } = useWebSocket();

  const { data: apiGames = [], isLoading } = useQuery<NFLGame[]>({
    queryKey: ["/api/games"],
  });

  const allGames = wsGames.length > 0 ? wsGames : apiGames;
  const game = allGames.find(g => g.id === gameId);

  const [prevHomeScore, setPrevHomeScore] = useState(0);
  const [prevAwayScore, setPrevAwayScore] = useState(0);
  const [scoreFlash, setScoreFlash] = useState<"home" | "away" | null>(null);

  useEffect(() => {
    if (gameId && isConnected) {
      subscribeToGame(gameId);
      requestPlays(gameId);
    }
  }, [gameId, isConnected, subscribeToGame, requestPlays]);

  useEffect(() => {
    if (game) {
      if (game.homeScore > prevHomeScore && prevHomeScore !== 0) {
        setScoreFlash("home");
        setTimeout(() => setScoreFlash(null), 2000);
      }
      if (game.awayScore > prevAwayScore && prevAwayScore !== 0) {
        setScoreFlash("away");
        setTimeout(() => setScoreFlash(null), 2000);
      }
      setPrevHomeScore(game.homeScore);
      setPrevAwayScore(game.awayScore);
    }
  }, [game?.homeScore, game?.awayScore]);

  const gamePlays = plays.get(gameId || "") || [];

  const scoringPlays = useMemo(() => {
    return gamePlays
      .filter(p => p.isScoring)
      .map((p, i) => ({
        id: p.id,
        quarter: p.quarter,
        time: p.time,
        team: p.team,
        teamColor: "",
        teamName: "",
        teamLogo: "",
        type: p.type,
        description: p.description,
        homeScore: 0,
        awayScore: 0,
      }));
  }, [gamePlays]);

  const mockHomePlayers = useMemo(() => {
    if (!game) return [];
    return [
      {
        id: "qb1",
        name: "Patrick Mahomes",
        position: "QB",
        team: game.homeTeam.name,
        teamId: game.homeTeam.id,
        passingYards: 285,
        passingTouchdowns: 2,
        interceptions: 0,
      },
      {
        id: "rb1",
        name: "Isiah Pacheco",
        position: "RB",
        team: game.homeTeam.name,
        teamId: game.homeTeam.id,
        rushingYards: 78,
        rushingTouchdowns: 1,
      },
      {
        id: "wr1",
        name: "Travis Kelce",
        position: "TE",
        team: game.homeTeam.name,
        teamId: game.homeTeam.id,
        receivingYards: 95,
        receptions: 7,
        receivingTouchdowns: 1,
      },
    ];
  }, [game]);

  const mockAwayPlayers = useMemo(() => {
    if (!game) return [];
    return [
      {
        id: "qb2",
        name: "Josh Allen",
        position: "QB",
        team: game.awayTeam.name,
        teamId: game.awayTeam.id,
        passingYards: 312,
        passingTouchdowns: 3,
        interceptions: 1,
      },
      {
        id: "rb2",
        name: "James Cook",
        position: "RB",
        team: game.awayTeam.name,
        teamId: game.awayTeam.id,
        rushingYards: 65,
        rushingTouchdowns: 0,
      },
      {
        id: "wr2",
        name: "Stefon Diggs",
        position: "WR",
        team: game.awayTeam.name,
        teamId: game.awayTeam.id,
        receivingYards: 128,
        receptions: 9,
        receivingTouchdowns: 2,
      },
    ];
  }, [game]);

  const calculateWinProbability = useMemo(() => {
    if (!game) return 50;
    
    const scoreDiff = game.homeScore - game.awayScore;
    const quarter = game.quarter || 1;
    const timeRemaining = game.timeRemaining || "15:00";
    const [mins] = timeRemaining.split(":").map(Number);
    const totalMinsLeft = (4 - quarter) * 15 + (mins || 0);
    
    let probability = 50;
    probability += scoreDiff * (1 + (60 - totalMinsLeft) / 60);
    
    if (game.possession === game.homeTeam.id) {
      probability += 3;
    } else if (game.possession === game.awayTeam.id) {
      probability -= 3;
    }
    
    if (game.redZone && game.possession === game.homeTeam.id) {
      probability += 5;
    } else if (game.redZone && game.possession === game.awayTeam.id) {
      probability -= 5;
    }
    
    return Math.min(99, Math.max(1, probability));
  }, [game]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-semibold mb-1">Game Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The game you're looking for doesn't exist or hasn't started yet
            </p>
            <Button variant="outline" asChild data-testid="button-back-scoreboard">
              <Link href="/scoreboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scoreboard
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isLive = game.status === "in_progress" || game.status === "halftime";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled" || game.status === "pregame";
  
  const homeWinning = game.homeScore > game.awayScore;
  const awayWinning = game.awayScore > game.homeScore;

  const driveStartYardLine = Math.max(10, game.yardLine - 25);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href="/scoreboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold" data-testid="heading-game-title">
            {game.awayTeam.displayName} @ {game.homeTeam.displayName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <MapPin className="h-3 w-3" />
            <span>{game.venue}</span>
            {isScheduled && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <Calendar className="h-3 w-3" />
                <span>{game.date}</span>
                <Clock className="h-3 w-3" />
                <span>{game.time}</span>
              </>
            )}
          </div>
        </div>
        {isLive && <LiveIndicator size="lg" />}
        {isFinal && (
          <Badge variant="secondary" className="text-sm" data-testid="badge-game-final">
            FINAL
          </Badge>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn(
          "overflow-visible relative",
          isLive && "ring-2 ring-red-500/30"
        )}>
          {isLive && (
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-lg"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 100%" }}
            />
          )}
          
          <CardContent className="p-6">
            {isLive && (
              <motion.div 
                className="flex items-center justify-center gap-2 mb-6"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                data-testid="game-clock"
              >
                <Badge 
                  variant="outline" 
                  className="text-xl font-mono px-4 py-2 border-2"
                >
                  {game.status === "halftime" ? (
                    "HALFTIME"
                  ) : (
                    <>Q{game.quarter} <span className="mx-2 text-muted-foreground">|</span> {game.timeRemaining}</>
                  )}
                </Badge>
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-4 md:gap-8 items-center">
              <motion.div 
                className={cn(
                  "text-center space-y-3 p-4 rounded-lg transition-all",
                  scoreFlash === "away" && "ring-2 ring-green-500 bg-green-500/10"
                )}
                animate={scoreFlash === "away" ? {
                  scale: [1, 1.02, 1],
                } : {}}
                transition={{ duration: 0.3 }}
                data-testid="away-team-section"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
                  <Helmet 
                    teamColor={game.awayTeam.color} 
                    alternateColor={game.awayTeam.alternateColor}
                    size="xl"
                    facingRight
                  />
                  <img
                    src={game.awayTeam.logo}
                    alt={game.awayTeam.name}
                    className="absolute inset-0 w-full h-full object-contain p-3"
                  />
                </div>
                <div>
                  <p className={cn(
                    "font-bold text-lg md:text-xl",
                    !awayWinning && isFinal && "opacity-60"
                  )} data-testid="text-away-team-name">
                    {game.awayTeam.shortDisplayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {game.awayTeam.record?.wins || 0}-{game.awayTeam.record?.losses || 0}
                  </p>
                </div>
                <AnimatePresence>
                  {game.possession === game.awayTeam.id && isLive && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center gap-1"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Football size="sm" />
                      </motion.div>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">POSSESSION</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 md:gap-6">
                  <AnimatedScore
                    score={isScheduled ? 0 : game.awayScore}
                    isWinning={awayWinning}
                    isLive={isLive}
                    size="xl"
                    teamColor={game.awayTeam.color}
                  />
                  <span className="text-2xl md:text-4xl text-muted-foreground font-light">-</span>
                  <AnimatedScore
                    score={isScheduled ? 0 : game.homeScore}
                    isWinning={homeWinning}
                    isLive={isLive}
                    size="xl"
                    teamColor={game.homeTeam.color}
                  />
                </div>
                
                {isScheduled && (
                  <div className="text-3xl md:text-5xl font-bold text-muted-foreground" data-testid="text-scheduled">
                    vs
                  </div>
                )}
                
                {isLive && game.down > 0 && (
                  <motion.div 
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid="down-distance-display"
                  >
                    <div className="flex items-center gap-2">
                      <DownMarker down={game.down} />
                      <Badge 
                        variant="outline" 
                        className="font-mono text-base px-3 py-1"
                        data-testid="badge-down-distance"
                      >
                        {game.down === 1 ? "1st" : game.down === 2 ? "2nd" : game.down === 3 ? "3rd" : "4th"} & {game.distance}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="font-mono text-xs"
                        data-testid="badge-yard-line"
                      >
                        Ball on {game.yardLine > 50 ? `${game.homeTeam.abbreviation} ${100 - game.yardLine}` : `${game.awayTeam.abbreviation} ${game.yardLine}`}
                      </Badge>
                      
                      {game.redZone && (
                        <motion.div
                          animate={{ opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Badge 
                            variant="destructive" 
                            className="text-xs gap-1"
                            data-testid="badge-redzone"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            RED ZONE
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div 
                className={cn(
                  "text-center space-y-3 p-4 rounded-lg transition-all",
                  scoreFlash === "home" && "ring-2 ring-green-500 bg-green-500/10"
                )}
                animate={scoreFlash === "home" ? {
                  scale: [1, 1.02, 1],
                } : {}}
                transition={{ duration: 0.3 }}
                data-testid="home-team-section"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto">
                  <Helmet 
                    teamColor={game.homeTeam.color} 
                    alternateColor={game.homeTeam.alternateColor}
                    size="xl"
                  />
                  <img
                    src={game.homeTeam.logo}
                    alt={game.homeTeam.name}
                    className="absolute inset-0 w-full h-full object-contain p-3"
                  />
                </div>
                <div>
                  <p className={cn(
                    "font-bold text-lg md:text-xl",
                    !homeWinning && isFinal && "opacity-60"
                  )} data-testid="text-home-team-name">
                    {game.homeTeam.shortDisplayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {game.homeTeam.record?.wins || 0}-{game.homeTeam.record?.losses || 0}
                  </p>
                </div>
                <AnimatePresence>
                  {game.possession === game.homeTeam.id && isLive && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center gap-1"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Football size="sm" />
                      </motion.div>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">POSSESSION</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {isLive && game.down > 0 && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FieldVisualization
                  ballPosition={game.yardLine}
                  homeTeamColor={game.homeTeam.color}
                  awayTeamColor={game.awayTeam.color}
                  homeTeamName={game.homeTeam.abbreviation}
                  awayTeamName={game.awayTeam.abbreviation}
                  down={game.down}
                  distance={game.distance}
                  possession={game.possession === game.homeTeam.id ? "home" : "away"}
                  driveStartYardLine={driveStartYardLine}
                  firstDownLine={Math.min(game.yardLine + game.distance, 100)}
                  redZone={game.redZone}
                />
              </motion.div>
            )}

            {game.broadcasts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-3 flex-wrap">
                {game.broadcasts.map((broadcast, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {broadcast.type === "tv" ? (
                      <Tv className="h-3 w-3" />
                    ) : (
                      <Radio className="h-3 w-3" />
                    )}
                    {broadcast.network}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {isLive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <WinProbability
            homeTeamId={game.homeTeam.id}
            awayTeamId={game.awayTeam.id}
            homeTeamColor={game.homeTeam.color}
            awayTeamColor={game.awayTeam.color}
            homeTeamName={game.homeTeam.shortDisplayName}
            awayTeamName={game.awayTeam.shortDisplayName}
            homeTeamLogo={game.homeTeam.logo}
            awayTeamLogo={game.awayTeam.logo}
            homeWinProbability={calculateWinProbability}
            isLive={isLive}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="plays" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plays" className="gap-2" data-testid="tab-plays">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Plays</span>
            </TabsTrigger>
            <TabsTrigger value="drive" className="gap-2" data-testid="tab-drive">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Drive</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2" data-testid="tab-stats">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2" data-testid="tab-scoring">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Scoring</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plays" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-foreground" />
                    Recent Plays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gamePlays.length > 0 ? (
                    <PlayByPlay 
                      plays={gamePlays} 
                      homeTeamId={game.homeTeam.id}
                      awayTeamId={game.awayTeam.id}
                      homeTeamColor={game.homeTeam.color}
                      awayTeamColor={game.awayTeam.color}
                    />
                  ) : isLive ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Activity className="h-8 w-8 mx-auto mb-2" />
                      </motion.div>
                      <p>Waiting for plays...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{isScheduled ? "Game hasn't started yet" : "No play data available"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <KeyPlayerStats
                homePlayers={mockHomePlayers}
                awayPlayers={mockAwayPlayers}
                homeTeamId={game.homeTeam.id}
                awayTeamId={game.awayTeam.id}
                homeTeamColor={game.homeTeam.color}
                awayTeamColor={game.awayTeam.color}
                homeTeamName={game.homeTeam.shortDisplayName}
                awayTeamName={game.awayTeam.shortDisplayName}
                homeTeamLogo={game.homeTeam.logo}
                awayTeamLogo={game.awayTeam.logo}
              />
            </div>
          </TabsContent>

          <TabsContent value="drive" className="mt-4">
            <DriveChart
              plays={gamePlays}
              currentYardLine={game.yardLine}
              startYardLine={driveStartYardLine}
              homeTeamId={game.homeTeam.id}
              awayTeamId={game.awayTeam.id}
              homeTeamColor={game.homeTeam.color}
              awayTeamColor={game.awayTeam.color}
              homeTeamName={game.homeTeam.shortDisplayName}
              awayTeamName={game.awayTeam.shortDisplayName}
              possession={game.possession}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <KeyPlayerStats
                homePlayers={mockHomePlayers}
                awayPlayers={mockAwayPlayers}
                homeTeamId={game.homeTeam.id}
                awayTeamId={game.awayTeam.id}
                homeTeamColor={game.homeTeam.color}
                awayTeamColor={game.awayTeam.color}
                homeTeamName={game.homeTeam.shortDisplayName}
                awayTeamName={game.awayTeam.shortDisplayName}
                homeTeamLogo={game.homeTeam.logo}
                awayTeamLogo={game.awayTeam.logo}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                    Team Matchup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <img
                          src={game.awayTeam.logo}
                          alt={game.awayTeam.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold">{game.awayTeam.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {game.awayTeam.record?.wins || 0}-{game.awayTeam.record?.losses || 0} | {game.awayTeam.conference} {game.awayTeam.division}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <img
                          src={game.homeTeam.logo}
                          alt={game.homeTeam.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold">{game.homeTeam.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {game.homeTeam.record?.wins || 0}-{game.homeTeam.record?.losses || 0} | {game.homeTeam.conference} {game.homeTeam.division}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="mt-4">
            <ScoringSummary
              scoringPlays={scoringPlays}
              homeTeamId={game.homeTeam.id}
              awayTeamId={game.awayTeam.id}
              homeTeamColor={game.homeTeam.color}
              awayTeamColor={game.awayTeam.color}
              homeTeamName={game.homeTeam.shortDisplayName}
              awayTeamName={game.awayTeam.shortDisplayName}
              homeTeamLogo={game.homeTeam.logo}
              awayTeamLogo={game.awayTeam.logo}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 justify-center flex-wrap"
      >
        <Button asChild data-testid="button-tickets">
          <Link href={`/tickets?game=${game.id}`}>
            <Ticket className="h-4 w-4 mr-2" />
            Get Tickets
          </Link>
        </Button>
        <Button variant="outline" asChild data-testid="button-view-away-team">
          <Link href={`/team/${game.awayTeam.id}`}>
            View {game.awayTeam.shortDisplayName}
          </Link>
        </Button>
        <Button variant="outline" asChild data-testid="button-view-home-team">
          <Link href={`/team/${game.homeTeam.id}`}>
            View {game.homeTeam.shortDisplayName}
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
