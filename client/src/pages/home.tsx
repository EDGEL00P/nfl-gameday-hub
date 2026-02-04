import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PremiumGameCard } from "@/components/premium-game-card";
import { NewsCard } from "@/components/news-card";
import { LiveIndicator } from "@/components/live-indicator";
import { ConnectionStatus } from "@/components/connection-status";
import { PlayTicker } from "@/components/play-ticker";
import { SmartFeed } from "@/components/smart-feed";
import { NFLShield, Football, LombardTrophy, GoalPost, Helmet } from "@/components/nfl-elements";
import { useFavoriteTeams } from "@/contexts/favorites-context";
import { useWebSocket } from "@/hooks/use-websocket";
import { NFL_TEAMS } from "@/lib/nfl-teams";
import { cn } from "@/lib/utils";
import { Zap, Calendar, RefreshCw, TrendingUp, Newspaper, Activity, Sparkles, Star, X, Heart } from "lucide-react";
import type { NFLGame, NFLNews } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

function FavoritesQuickAccess() {
  const { favoriteTeams, removeFavoriteTeam } = useFavoriteTeams();
  
  const teams = useMemo(() => {
    return favoriteTeams
      .map(id => NFL_TEAMS.find(t => t.id === id))
      .filter(Boolean);
  }, [favoriteTeams]);
  
  if (teams.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
      data-testid="favorites-quick-access"
    >
      <div className="flex items-center gap-2 mb-2">
        <Heart className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-muted-foreground">Your Teams</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {teams.map((team) => team && (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
          >
            <Link href={`/team/${team.id}`}>
              <Badge 
                variant="secondary" 
                className="gap-2 py-1.5 px-3 cursor-pointer group"
                data-testid={`favorite-team-badge-${team.id}`}
              >
                <div className="relative w-5 h-5">
                  <Helmet
                    teamColor={team.color}
                    alternateColor={team.alternateColor}
                    size="sm"
                  />
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <span className="font-medium">{team.abbreviation}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavoriteTeam(team.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`remove-favorite-${team.id}`}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            </Link>
          </motion.div>
        ))}
        <Link href="/teams">
          <Badge 
            variant="outline" 
            className="gap-1 py-1.5 px-3 cursor-pointer border-dashed"
            data-testid="add-favorite-team-button"
          >
            <Star className="h-3 w-3" />
            <span>Add Team</span>
          </Badge>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedWeek] = useState("current");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  
  const { favoriteTeams } = useFavoriteTeams();

  const { games: wsGames, plays, isConnected } = useWebSocket();

  const { data: apiGames = [], isLoading: gamesLoading, refetch: refetchGames } = useQuery<NFLGame[]>({
    queryKey: ["/api/games", selectedWeek],
    refetchInterval: isConnected ? false : 10000,
  });

  const { data: news = [], isLoading: newsLoading } = useQuery<NFLNews[]>({
    queryKey: ["/api/news"],
  });

  const games = wsGames.length > 0 ? wsGames : apiGames;

  useEffect(() => {
    if (wsGames.length > 0) {
      setLastUpdated(new Date());
    }
  }, [wsGames]);

  const liveGames = games.filter(g => g.status === "in_progress" || g.status === "halftime");
  const upcomingGames = games.filter(g => g.status === "scheduled" || g.status === "pregame");
  const completedGames = games.filter(g => g.status === "final");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchGames();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <NFLShield size="lg" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" data-testid="heading-live-scores">
              <Football size="md" />
              <span>
                Live Scores
              </span>
              {liveGames.length > 0 && (
                <Badge variant="destructive" className="ml-2 animate-pulse" data-testid="badge-live-count">
                  {liveGames.length} LIVE
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Real-time NFL game updates with sub-10 second refresh
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdated} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
            data-testid="button-refresh-scores"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </motion.div>

      <FavoritesQuickAccess />

      {liveGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative p-5 rounded-2xl gradient-border overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(234, 88, 12, 0.08) 50%, rgba(239, 68, 68, 0.08) 100%)"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 shimmer pointer-events-none" />
          
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LiveIndicator size="lg" />
              <div>
                <h2 className="font-bold text-lg" data-testid="heading-live-games">
                  {liveGames.length} {liveGames.length === 1 ? "Game" : "Games"} In Progress
                </h2>
                <p className="text-xs text-muted-foreground">
                  Scores update automatically every few seconds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <GoalPost />
              <LombardTrophy size="md" glowing />
              <GoalPost />
            </div>
          </div>
          
          <ScrollArea className="w-full">
            <motion.div 
              className="flex gap-4 pb-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {liveGames.map((game) => (
                <motion.div 
                  key={game.id} 
                  className="min-w-[340px]"
                  variants={itemVariants}
                >
                  <PremiumGameCard game={game} showField />
                </motion.div>
              ))}
            </motion.div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger 
                value="for-you" 
                className="gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                data-testid="tab-for-you"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="gap-2 text-sm" 
                data-testid="tab-upcoming"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Upcoming</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {upcomingGames.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="live" 
                className="gap-2 text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white" 
                data-testid="tab-live"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Live</span>
                <Badge 
                  variant={liveGames.length > 0 ? "destructive" : "secondary"} 
                  className="ml-1 h-5 px-1.5 text-[10px]"
                >
                  {liveGames.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="final" 
                className="gap-2 text-sm" 
                data-testid="tab-final"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Final</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {completedGames.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="for-you" className="mt-4">
              <SmartFeed games={games} isLoading={gamesLoading} />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
              {gamesLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-52 animate-pulse bg-muted shimmer" />
                  ))}
                </div>
              ) : upcomingGames.length > 0 ? (
                <motion.div 
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {upcomingGames.map((game) => (
                      <motion.div key={game.id} variants={itemVariants}>
                        <PremiumGameCard game={game} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-1">No Upcoming Games</h3>
                    <p className="text-sm text-muted-foreground">Check back later for the next scheduled games</p>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="live" className="mt-4">
              {liveGames.length > 0 ? (
                <motion.div 
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {liveGames.map((game) => (
                      <motion.div key={game.id} variants={itemVariants}>
                        <PremiumGameCard game={game} showField />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-8 text-center">
                    <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-1">No Live Games Right Now</h3>
                    <p className="text-sm text-muted-foreground">Check back during game time for live action</p>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="final" className="mt-4">
              {completedGames.length > 0 ? (
                <motion.div 
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence mode="popLayout">
                    {completedGames.map((game) => (
                      <motion.div key={game.id} variants={itemVariants}>
                        <PremiumGameCard game={game} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold mb-1">No Completed Games This Week</h3>
                    <p className="text-sm text-muted-foreground">Final scores will appear here</p>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {liveGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Live Play-by-Play
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayTicker 
                    plays={Array.from(plays.values()).flat()} 
                    maxPlays={6} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              Latest News
            </h2>
            <Button variant="ghost" size="sm" asChild data-testid="link-view-all-news">
              <a href="/news">View All</a>
            </Button>
          </div>
          
          {newsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-24 animate-pulse bg-muted shimmer" />
              ))}
            </div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {news.slice(0, 5).map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <NewsCard news={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
