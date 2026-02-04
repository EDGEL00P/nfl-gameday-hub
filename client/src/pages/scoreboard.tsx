import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiveIndicator } from "@/components/live-indicator";
import { AnimatedScore } from "@/components/animated-score";
import { Helmet, Football } from "@/components/nfl-elements";
import { useFavoriteTeams } from "@/contexts/favorites-context";
import { useWebSocket } from "@/hooks/use-websocket";
import { NFL_TEAMS, getAllDivisions } from "@/lib/nfl-teams";
import { cn } from "@/lib/utils";
import { 
  Grid3X3, 
  Heart, 
  Clock, 
  WifiOff, 
  RefreshCw, 
  Calendar,
  Tv,
  ChevronRight,
  Circle,
  Loader2,
  AlertCircle
} from "lucide-react";
import type { NFLGame } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

type FilterType = "all" | "favorites" | "division" | "primetime";

interface LiveScoreCardProps {
  game: NFLGame;
}

function LiveScoreCard({ game }: LiveScoreCardProps) {
  const isLive = game.status === "in_progress" || game.status === "halftime";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled" || game.status === "pregame";
  
  const homeWinning = game.homeScore > game.awayScore;
  const awayWinning = game.awayScore > game.homeScore;

  return (
    <Link href={`/game/${game.id}`} data-testid={`link-game-${game.id}`}>
      <Card
        className={cn(
          "relative overflow-visible transition-all duration-200 cursor-pointer hover-elevate active-elevate-2",
          isLive && "ring-2 ring-red-500/40"
        )}
        data-testid={`scorecard-${game.id}`}
      >
        {isLive && (
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-md"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          />
        )}

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isLive && <LiveIndicator size="sm" />}
              {isFinal && (
                <Badge variant="secondary" className="text-[10px] font-semibold uppercase" data-testid={`badge-final-${game.id}`}>
                  Final
                </Badge>
              )}
              {isScheduled && (
                <Badge variant="outline" className="text-[10px] font-medium gap-1" data-testid={`badge-scheduled-${game.id}`}>
                  <Calendar className="h-3 w-3" />
                  {game.time}
                </Badge>
              )}
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground" data-testid={`clock-${game.id}`}>
                <span className="font-bold">Q{game.quarter}</span>
                <span className="w-px h-3 bg-border" />
                <span>{game.timeRemaining}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                awayWinning && (isLive || isFinal) && "bg-muted/50"
              )}
              data-testid={`away-team-${game.id}`}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <Helmet 
                  teamColor={game.awayTeam.color} 
                  alternateColor={game.awayTeam.alternateColor}
                  size="md"
                  facingRight
                />
                <img
                  src={game.awayTeam.logo}
                  alt={game.awayTeam.name}
                  className="absolute inset-0 w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-base truncate",
                  !awayWinning && isFinal && "opacity-60"
                )} data-testid={`away-name-${game.id}`}>
                  {game.awayTeam.abbreviation}
                </p>
              </div>
              {game.possession === game.awayTeam.id && isLive && (
                <Circle className="h-2 w-2 fill-current text-amber-500" data-testid={`possession-away-${game.id}`} />
              )}
              <span className={cn(
                "text-3xl font-bold tabular-nums min-w-[3ch] text-right",
                awayWinning && (isLive || isFinal) && "text-foreground",
                !awayWinning && isFinal && "opacity-60"
              )} data-testid={`away-score-${game.id}`}>
                {isScheduled ? "-" : game.awayScore}
              </span>
            </div>

            <div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                homeWinning && (isLive || isFinal) && "bg-muted/50"
              )}
              data-testid={`home-team-${game.id}`}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <Helmet 
                  teamColor={game.homeTeam.color} 
                  alternateColor={game.homeTeam.alternateColor}
                  size="md"
                />
                <img
                  src={game.homeTeam.logo}
                  alt={game.homeTeam.name}
                  className="absolute inset-0 w-full h-full object-contain p-0.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-base truncate",
                  !homeWinning && isFinal && "opacity-60"
                )} data-testid={`home-name-${game.id}`}>
                  {game.homeTeam.abbreviation}
                </p>
              </div>
              {game.possession === game.homeTeam.id && isLive && (
                <Circle className="h-2 w-2 fill-current text-amber-500" data-testid={`possession-home-${game.id}`} />
              )}
              <span className={cn(
                "text-3xl font-bold tabular-nums min-w-[3ch] text-right",
                homeWinning && (isLive || isFinal) && "text-foreground",
                !homeWinning && isFinal && "opacity-60"
              )} data-testid={`home-score-${game.id}`}>
                {isScheduled ? "-" : game.homeScore}
              </span>
            </div>
          </div>

          {isLive && game.redZone && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-2"
            >
              <Badge variant="destructive" className="text-[10px] w-full justify-center" data-testid={`redzone-${game.id}`}>
                RED ZONE
              </Badge>
            </motion.div>
          )}

          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{game.venue}</span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString();
}

export default function Scoreboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [relativeTime, setRelativeTime] = useState("just now");
  
  const isOnline = useOnlineStatus();
  const { favoriteTeams } = useFavoriteTeams();
  const { games: wsGames, isConnected } = useWebSocket();

  const { data: apiGames = [], isLoading, error, refetch } = useQuery<NFLGame[]>({
    queryKey: ["/api/games"],
    refetchInterval: isConnected ? false : 10000,
  });

  const games = wsGames.length > 0 ? wsGames : apiGames;
  const divisions = useMemo(() => getAllDivisions(), []);

  useEffect(() => {
    if (wsGames.length > 0) {
      setLastUpdated(new Date());
    }
  }, [wsGames]);

  useEffect(() => {
    const updateTime = () => setRelativeTime(getRelativeTime(lastUpdated));
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const isPrimeTimeGame = useCallback((game: NFLGame): boolean => {
    const broadcasts = game.broadcasts.map(b => b.network.toLowerCase());
    const primeTimeNetworks = ["nbc", "espn", "abc", "amazon prime", "prime video", "nfl network"];
    const isPrimeTime = broadcasts.some(network => 
      primeTimeNetworks.some(pt => network.includes(pt))
    );
    const time = game.time.toLowerCase();
    const isPrimeTimeSlot = time.includes("8:") || time.includes("pm") && !time.includes("1:") && !time.includes("4:");
    return isPrimeTime || isPrimeTimeSlot;
  }, []);

  const filteredGames = useMemo(() => {
    let result = [...games];

    switch (activeFilter) {
      case "favorites":
        result = result.filter(game => 
          favoriteTeams.includes(game.homeTeam.id) || 
          favoriteTeams.includes(game.awayTeam.id)
        );
        break;
      case "division":
        if (selectedDivision) {
          const [conf, div] = selectedDivision.split("-");
          const divisionTeams = NFL_TEAMS
            .filter(t => t.conference === conf && t.division === div)
            .map(t => t.id);
          result = result.filter(game => 
            divisionTeams.includes(game.homeTeam.id) || 
            divisionTeams.includes(game.awayTeam.id)
          );
        }
        break;
      case "primetime":
        result = result.filter(isPrimeTimeGame);
        break;
    }

    return result.sort((a, b) => {
      const statusOrder = { in_progress: 0, halftime: 1, pregame: 2, scheduled: 3, final: 4, postponed: 5, cancelled: 6 };
      return (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9);
    });
  }, [games, activeFilter, selectedDivision, favoriteTeams, isPrimeTimeGame]);

  const liveCount = games.filter(g => g.status === "in_progress" || g.status === "halftime").length;

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Grid3X3 className="h-7 w-7 text-foreground" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="heading-scoreboard">
                Live Scoreboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {liveCount > 0 && (
                  <Badge variant="destructive" className="gap-1" data-testid="badge-live-count">
                    <LiveIndicator size="sm" />
                    {liveCount} Live
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1" data-testid="last-updated">
                  <Clock className="h-3 w-3" />
                  Last updated: {relativeTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="secondary" className="gap-1 text-amber-600 dark:text-amber-400" data-testid="badge-offline">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
            {isOnline && !isConnected && (
              <Badge variant="secondary" className="gap-1" data-testid="badge-reconnecting">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reconnecting...
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!isOnline}
              className="gap-1.5"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            data-testid="filter-all"
          >
            <Grid3X3 className="h-4 w-4 mr-1.5" />
            All Games
          </Button>
          <Button
            variant={activeFilter === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("favorites")}
            className={cn(favoriteTeams.length === 0 && "opacity-50")}
            disabled={favoriteTeams.length === 0}
            data-testid="filter-favorites"
          >
            <Heart className="h-4 w-4 mr-1.5" />
            Favorites
            {favoriteTeams.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {favoriteTeams.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeFilter === "primetime" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("primetime")}
            data-testid="filter-primetime"
          >
            <Tv className="h-4 w-4 mr-1.5" />
            Prime Time
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === "division" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("division")}
              data-testid="filter-division"
            >
              Division
            </Button>
            {activeFilter === "division" && (
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger className="w-[140px]" data-testid="select-division-filter">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem 
                      key={`${div.conference}-${div.division}`} 
                      value={`${div.conference}-${div.division}`}
                      data-testid={`select-option-${div.conference}-${div.division}`}
                    >
                      {div.conference} {div.division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </motion.div>

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2"
          data-testid="offline-banner"
        >
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            You're offline. Showing cached data from {relativeTime}.
          </span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 rounded-lg bg-destructive/10 border border-destructive/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">Unable to fetch live games</h3>
          </div>
          <p className="text-sm text-destructive/90 mb-4">
            {(error as Error).message || "An error occurred while connecting to the game data provided."}
          </p>
          <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded border border-border/50">
            <p className="font-medium mb-1">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Verify <strong>BALLDONTLIE_API_KEY</strong> environment variable is set</li>
              <li>Check browser console for details</li>
            </ul>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants} layout>
                <LiveScoreCard game={game} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center">
            {activeFilter === "favorites" ? (
              <>
                <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">No Favorite Team Games</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add teams to your favorites to see their games here
                </p>
                <Button variant="outline" asChild data-testid="button-add-favorites">
                  <Link href="/teams">Browse Teams</Link>
                </Button>
              </>
            ) : activeFilter === "primetime" ? (
              <>
                <Tv className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">No Prime Time Games</h3>
                <p className="text-sm text-muted-foreground">
                  Check back for Sunday Night, Monday Night, or Thursday Night games
                </p>
              </>
            ) : activeFilter === "division" && !selectedDivision ? (
              <>
                <Grid3X3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">Select a Division</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a division from the dropdown to filter games
                </p>
              </>
            ) : (
              <>
                <Grid3X3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold mb-1">No Games Found</h3>
                <p className="text-sm text-muted-foreground">
                  No games match the current filter
                </p>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
