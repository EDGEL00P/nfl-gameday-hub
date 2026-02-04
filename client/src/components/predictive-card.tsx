import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Helmet, Football } from "@/components/nfl-elements";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, Trophy, History, ChevronRight, Zap, Timer } from "lucide-react";
import { Link } from "wouter";
import type { NFLGame } from "@shared/schema";
import { motion } from "framer-motion";

export type PredictiveCardType = 
  | "starts_soon"
  | "fourth_quarter"
  | "overtime"
  | "two_minute_warning"
  | "what_you_missed";

interface PredictiveCardProps {
  game: NFLGame;
  type: PredictiveCardType;
  minutesUntilStart?: number;
}

function getCardConfig(type: PredictiveCardType, game: NFLGame, minutesUntilStart?: number) {
  switch (type) {
    case "starts_soon":
      return {
        icon: Clock,
        title: `Starts in ${minutesUntilStart || 0} min`,
        subtitle: "Your team is about to play",
        urgency: minutesUntilStart && minutesUntilStart <= 5 ? "high" : "medium",
        gradient: "from-blue-500/20 via-blue-400/10 to-blue-500/5",
        borderColor: "ring-blue-500/40",
        badgeVariant: "default" as const,
      };
    case "fourth_quarter":
      return {
        icon: Zap,
        title: "4th Quarter",
        subtitle: `${game.timeRemaining} remaining`,
        urgency: "high",
        gradient: "from-orange-500/20 via-orange-400/10 to-orange-500/5",
        borderColor: "ring-orange-500/40",
        badgeVariant: "destructive" as const,
      };
    case "overtime":
      return {
        icon: AlertTriangle,
        title: "OVERTIME",
        subtitle: "Game extended",
        urgency: "critical",
        gradient: "from-red-500/25 via-red-400/15 to-red-500/10",
        borderColor: "ring-red-500/60",
        badgeVariant: "destructive" as const,
      };
    case "two_minute_warning":
      return {
        icon: Timer,
        title: "2-Minute Warning",
        subtitle: "Critical moment",
        urgency: "critical",
        gradient: "from-yellow-500/25 via-yellow-400/15 to-yellow-500/10",
        borderColor: "ring-yellow-500/60",
        badgeVariant: "destructive" as const,
      };
    case "what_you_missed":
      return {
        icon: History,
        title: "What You Missed",
        subtitle: "Game Recap",
        urgency: "low",
        gradient: "from-muted/50 via-muted/30 to-muted/10",
        borderColor: "ring-muted-foreground/20",
        badgeVariant: "secondary" as const,
      };
  }
}

export function PredictiveCard({ game, type, minutesUntilStart }: PredictiveCardProps) {
  const config = getCardConfig(type, game, minutesUntilStart);
  const Icon = config.icon;
  
  const homeWinning = game.homeScore > game.awayScore;
  const awayWinning = game.awayScore > game.homeScore;
  const isFinal = game.status === "final";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      data-testid={`predictive-card-${type}-${game.id}`}
    >
      <Card
        className={cn(
          "relative overflow-visible hover-elevate active-elevate-2",
          config.urgency === "critical" && "ring-2",
          config.urgency === "high" && "ring-1",
          config.borderColor
        )}
      >
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br pointer-events-none rounded-lg",
            config.gradient
          )}
        />
        
        {config.urgency === "critical" && (
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: "200% 100%" }}
          />
        )}

        <Link href={`/game/${game.id}`}>
          <div className="relative p-4 cursor-pointer" data-testid={`predictive-card-link-${game.id}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={config.urgency === "critical" ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    config.urgency === "critical" && "text-red-500",
                    config.urgency === "high" && "text-orange-500",
                    config.urgency === "medium" && "text-blue-500",
                    config.urgency === "low" && "text-muted-foreground"
                  )} />
                </motion.div>
                <div>
                  <p className="font-bold text-sm" data-testid={`predictive-card-title-${game.id}`}>
                    {config.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.subtitle}
                  </p>
                </div>
              </div>
              <Badge variant={config.badgeVariant} className="text-[10px]" data-testid={`predictive-card-badge-${game.id}`}>
                {type === "overtime" ? "OT" : 
                 type === "fourth_quarter" ? "Q4" :
                 type === "two_minute_warning" ? "2 MIN" :
                 type === "what_you_missed" ? "FINAL" : "SOON"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="relative w-8 h-8">
                    <Helmet 
                      teamColor={game.awayTeam.color} 
                      alternateColor={game.awayTeam.alternateColor}
                      size="sm"
                      facingRight
                    />
                    <img
                      src={game.awayTeam.logo}
                      alt={game.awayTeam.name}
                      className="absolute inset-0 w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className={cn(
                    "font-bold text-sm",
                    awayWinning && isFinal && "text-foreground",
                    !awayWinning && isFinal && "opacity-60"
                  )} data-testid={`predictive-team-away-${game.id}`}>
                    {game.awayTeam.abbreviation}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-2">
                  {isFinal || game.status === "in_progress" || game.status === "halftime" ? (
                    <>
                      <span className={cn(
                        "font-bold text-lg tabular-nums",
                        awayWinning && "text-foreground",
                        !awayWinning && isFinal && "opacity-60"
                      )} data-testid={`predictive-score-away-${game.id}`}>
                        {game.awayScore}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className={cn(
                        "font-bold text-lg tabular-nums",
                        homeWinning && "text-foreground",
                        !homeWinning && isFinal && "opacity-60"
                      )} data-testid={`predictive-score-home-${game.id}`}>
                        {game.homeScore}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground" data-testid={`predictive-time-${game.id}`}>
                      {game.time}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "font-bold text-sm",
                    homeWinning && isFinal && "text-foreground",
                    !homeWinning && isFinal && "opacity-60"
                  )} data-testid={`predictive-team-home-${game.id}`}>
                    {game.homeTeam.abbreviation}
                  </span>
                  <div className="relative w-8 h-8">
                    <Helmet 
                      teamColor={game.homeTeam.color} 
                      alternateColor={game.homeTeam.alternateColor}
                      size="sm"
                    />
                    <img
                      src={game.homeTeam.logo}
                      alt={game.homeTeam.name}
                      className="absolute inset-0 w-full h-full object-contain p-0.5"
                    />
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="ml-2" data-testid={`predictive-card-action-${game.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {isFinal && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Trophy className="h-3 w-3" />
                  <span data-testid={`predictive-recap-${game.id}`}>
                    {homeWinning ? game.homeTeam.shortDisplayName : game.awayTeam.shortDisplayName} won by {Math.abs(game.homeScore - game.awayScore)} points
                  </span>
                </div>
              </div>
            )}

            {(type === "fourth_quarter" || type === "overtime" || type === "two_minute_warning") && game.redZone && (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-2"
              >
                <Badge variant="destructive" className="text-[10px]" data-testid={`predictive-redzone-${game.id}`}>
                  <Football size="sm" className="mr-1" />
                  RED ZONE
                </Badge>
              </motion.div>
            )}
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
