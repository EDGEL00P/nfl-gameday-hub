import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGameCard } from "@/components/premium-game-card";
import { PredictiveCard, type PredictiveCardType } from "@/components/predictive-card";
import { useFavoriteTeams } from "@/contexts/favorites-context";
import { cn } from "@/lib/utils";
import { Sparkles, Star } from "lucide-react";
import type { NFLGame } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface SmartFeedProps {
  games: NFLGame[];
  isLoading?: boolean;
}

interface FeedItem {
  id: string;
  game: NFLGame;
  type: "predictive" | "premium";
  predictiveType?: PredictiveCardType;
  minutesUntilStart?: number;
  priority: number;
  isFeatured: boolean;
}

function getMinutesUntilStart(gameTime: string): number {
  const now = new Date();
  const [time, period] = gameTime.split(" ");
  if (!time) return 999;
  
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr || "0", 10);
  const minutes = parseInt(minutesStr || "0", 10);
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  const gameDate = new Date();
  gameDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = gameDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

function classifyGame(game: NFLGame, favoriteTeamIds: string[]): FeedItem | null {
  const isFavoriteGame = favoriteTeamIds.includes(game.homeTeam.id) || favoriteTeamIds.includes(game.awayTeam.id);
  const isLive = game.status === "in_progress" || game.status === "halftime";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled" || game.status === "pregame";
  
  if (isLive && isFavoriteGame) {
    const timeRemaining = game.timeRemaining || "";
    const isOT = game.quarter > 4;
    const is4thQuarter = game.quarter === 4;
    const is2MinWarning = is4thQuarter && (timeRemaining.includes("2:0") || timeRemaining.includes("1:"));
    
    if (isOT) {
      return {
        id: `ot-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "overtime",
        priority: 100,
        isFeatured: true,
      };
    }
    
    if (is2MinWarning) {
      return {
        id: `2min-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "two_minute_warning",
        priority: 95,
        isFeatured: true,
      };
    }
    
    if (is4thQuarter) {
      return {
        id: `q4-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "fourth_quarter",
        priority: 90,
        isFeatured: true,
      };
    }
    
    return {
      id: `live-fav-${game.id}`,
      game,
      type: "premium",
      priority: 85,
      isFeatured: true,
    };
  }
  
  if (isLive && !isFavoriteGame) {
    const isOT = game.quarter > 4;
    const is4thQuarter = game.quarter === 4;
    
    if (isOT) {
      return {
        id: `ot-other-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "overtime",
        priority: 80,
        isFeatured: false,
      };
    }
    
    if (is4thQuarter) {
      return {
        id: `q4-other-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "fourth_quarter",
        priority: 70,
        isFeatured: false,
      };
    }
    
    return {
      id: `live-other-${game.id}`,
      game,
      type: "premium",
      priority: 60,
      isFeatured: false,
    };
  }
  
  if (isScheduled && isFavoriteGame) {
    const minutesUntil = getMinutesUntilStart(game.time);
    
    if (minutesUntil <= 60) {
      return {
        id: `soon-${game.id}`,
        game,
        type: "predictive",
        predictiveType: "starts_soon",
        minutesUntilStart: minutesUntil,
        priority: minutesUntil <= 15 ? 75 : 50,
        isFeatured: minutesUntil <= 15,
      };
    }
    
    return {
      id: `upcoming-fav-${game.id}`,
      game,
      type: "premium",
      priority: 40,
      isFeatured: false,
    };
  }
  
  if (isFinal && isFavoriteGame) {
    return {
      id: `missed-${game.id}`,
      game,
      type: "predictive",
      predictiveType: "what_you_missed",
      priority: 30,
      isFeatured: false,
    };
  }
  
  if (isScheduled) {
    return {
      id: `upcoming-${game.id}`,
      game,
      type: "premium",
      priority: 20,
      isFeatured: false,
    };
  }
  
  if (isFinal) {
    return {
      id: `final-${game.id}`,
      game,
      type: "premium",
      priority: 10,
      isFeatured: false,
    };
  }
  
  return null;
}

function SmartFeedSkeleton() {
  return (
    <div className="space-y-4" data-testid="smart-feed-loading">
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 shimmer" />
        <Skeleton className="h-48 shimmer" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 shimmer" />
        <Skeleton className="h-32 shimmer" />
        <Skeleton className="h-32 shimmer" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 shimmer" />
        <Skeleton className="h-48 shimmer" />
      </div>
    </div>
  );
}

export function SmartFeed({ games, isLoading }: SmartFeedProps) {
  const { favoriteTeams } = useFavoriteTeams();
  
  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];
    
    for (const game of games) {
      const item = classifyGame(game, favoriteTeams);
      if (item) {
        items.push(item);
      }
    }
    
    items.sort((a, b) => b.priority - a.priority);
    
    return items;
  }, [games, favoriteTeams]);
  
  const featuredItems = feedItems.filter((item) => item.isFeatured);
  const regularItems = feedItems.filter((item) => !item.isFeatured);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (isLoading) {
    return <SmartFeedSkeleton />;
  }
  
  if (feedItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-8 text-center" data-testid="smart-feed-empty">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-semibold mb-1">No Games Available</h3>
          <p className="text-sm text-muted-foreground">
            Add your favorite teams to see personalized content
          </p>
        </Card>
      </motion.div>
    );
  }
  
  const hasFavorites = favoriteTeams.length > 0;
  
  return (
    <div className="space-y-6" data-testid="smart-feed">
      {!hasFavorites && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-dashed" data-testid="smart-feed-no-favorites-hint">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Personalize your feed</p>
                <p className="text-xs text-muted-foreground">
                  Add favorite teams to see prioritized updates and alerts
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {featuredItems.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span data-testid="smart-feed-featured-label">Priority Updates</span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {featuredItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={itemVariants}
                  className="col-span-1"
                >
                  {item.type === "predictive" && item.predictiveType ? (
                    <PredictiveCard 
                      game={item.game} 
                      type={item.predictiveType}
                      minutesUntilStart={item.minutesUntilStart}
                    />
                  ) : (
                    <PremiumGameCard game={item.game} showField />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      
      {regularItems.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {featuredItems.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span data-testid="smart-feed-other-label">Other Games</span>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {regularItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={itemVariants}
                >
                  {item.type === "predictive" && item.predictiveType ? (
                    <PredictiveCard 
                      game={item.game} 
                      type={item.predictiveType}
                      minutesUntilStart={item.minutesUntilStart}
                    />
                  ) : (
                    <PremiumGameCard game={item.game} compact />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
