import { useState, useEffect, memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/live-indicator";
import { AnimatedScore } from "@/components/animated-score";
import { FieldPosition } from "@/components/field-position";
import { Helmet, Football, DownMarker } from "@/components/nfl-elements";
import { cn } from "@/lib/utils";
import { ChevronRight, Tv, Radio, Ticket, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { NFLGame } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumGameCardProps {
  game: NFLGame;
  compact?: boolean;
  showField?: boolean;
}

export const PremiumGameCard = memo(function PremiumGameCard({ game, compact = false, showField = false }: PremiumGameCardProps) {
  const isLive = game.status === "in_progress" || game.status === "halftime";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled" || game.status === "pregame";
  
  const homeWinning = game.homeScore > game.awayScore;
  const awayWinning = game.awayScore > game.homeScore;

  const [prevHomeScore, setPrevHomeScore] = useState(game.homeScore);
  const [prevAwayScore, setPrevAwayScore] = useState(game.awayScore);
  const [scoreChanged, setScoreChanged] = useState(false);

  useEffect(() => {
    if (game.homeScore !== prevHomeScore || game.awayScore !== prevAwayScore) {
      setScoreChanged(true);
      setPrevHomeScore(game.homeScore);
      setPrevAwayScore(game.awayScore);
      const timer = setTimeout(() => setScoreChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [game.homeScore, game.awayScore, prevHomeScore, prevAwayScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 h-full hover-elevate active-elevate-2",
          isLive && "ring-2 ring-red-500/40",
          scoreChanged && isLive && "ring-green-500/50"
        )}
        style={isLive ? {
          boxShadow: "0 0 30px rgba(239, 68, 68, 0.15)"
        } : undefined}
        data-testid={`game-card-${game.id}`}
      >
        {isLive && (
          <>
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 100%" }}
            />
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${game.awayTeam.color} 0%, transparent 40%, transparent 60%, ${game.homeTeam.color} 100%)`
              }}
            />
          </>
        )}

        <Link href={`/game/${game.id}`}>
          <div className={cn("p-4 cursor-pointer", compact && "p-3")}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isLive && <LiveIndicator size="sm" />}
                {isFinal && (
                  <Badge variant="secondary" className="text-[10px] font-semibold" data-testid="badge-final">
                    FINAL
                  </Badge>
                )}
                {isScheduled && (
                  <span className="text-sm font-medium text-muted-foreground" data-testid="text-game-time">
                    {game.time}
                  </span>
                )}
              </div>
              {isLive && (
                <motion.div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 dark:bg-white/10"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  data-testid="display-game-clock"
                >
                  <span className="text-xs font-bold">Q{game.quarter}</span>
                  <span className="w-px h-3 bg-border" />
                  <span className="text-xs font-mono">{game.timeRemaining}</span>
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <motion.div 
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  awayWinning && (isLive || isFinal) && "bg-muted/50"
                )}
                data-testid={`team-row-${game.awayTeam.id}`}
              >
                <div className="relative">
                  <Helmet 
                    teamColor={game.awayTeam.color} 
                    alternateColor={game.awayTeam.alternateColor}
                    size="md"
                    facingRight
                  />
                  <img
                    src={game.awayTeam.logo}
                    alt={game.awayTeam.name}
                    className="absolute inset-0 w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-bold truncate text-base",
                    awayWinning && (isLive || isFinal) && "text-foreground",
                    !awayWinning && isFinal && "opacity-60"
                  )} data-testid={`text-team-name-${game.awayTeam.id}`}>
                    {game.awayTeam.shortDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {game.awayTeam.record?.wins || 0}-{game.awayTeam.record?.losses || 0}
                  </p>
                </div>
                <AnimatedScore 
                  score={game.awayScore} 
                  isWinning={awayWinning && (isLive || isFinal)}
                  isLive={isLive}
                  size="lg"
                  teamColor={game.awayTeam.color}
                />
                {game.possession === game.awayTeam.id && isLive && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Football size="sm" />
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  homeWinning && (isLive || isFinal) && "bg-muted/50"
                )}
                data-testid={`team-row-${game.homeTeam.id}`}
              >
                <div className="relative">
                  <Helmet 
                    teamColor={game.homeTeam.color} 
                    alternateColor={game.homeTeam.alternateColor}
                    size="md"
                  />
                  <img
                    src={game.homeTeam.logo}
                    alt={game.homeTeam.name}
                    className="absolute inset-0 w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-bold truncate text-base",
                    homeWinning && (isLive || isFinal) && "text-foreground",
                    !homeWinning && isFinal && "opacity-60"
                  )} data-testid={`text-team-name-${game.homeTeam.id}`}>
                    {game.homeTeam.shortDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {game.homeTeam.record?.wins || 0}-{game.homeTeam.record?.losses || 0}
                  </p>
                </div>
                <AnimatedScore 
                  score={game.homeScore} 
                  isWinning={homeWinning && (isLive || isFinal)}
                  isLive={isLive}
                  size="lg"
                  teamColor={game.homeTeam.color}
                />
                {game.possession === game.homeTeam.id && isLive && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Football size="sm" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {isLive && (
              <motion.div 
                className="mt-4 pt-3 border-t border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {showField && game.yardLine !== undefined && (
                  <div className="mb-3">
                    <FieldPosition
                      yardLine={game.yardLine}
                      possession={game.possession || ""}
                      homeTeamId={game.homeTeam.id}
                      awayTeamId={game.awayTeam.id}
                      homeColor={game.homeTeam.color}
                      awayColor={game.awayTeam.color}
                      redZone={game.redZone}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {game.down > 0 && (
                      <DownMarker down={game.down} />
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono px-2" data-testid="badge-down-distance">
                      {game.down > 0 ? `${game.distance} to go` : ""}
                    </Badge>
                    {game.redZone && (
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Badge variant="destructive" className="text-[10px]" data-testid="badge-redzone">
                          RED ZONE
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <span className="text-muted-foreground font-mono" data-testid="text-yardline">
                    {game.yardLine} yd line
                  </span>
                </div>
              </motion.div>
            )}

            {!compact && game.broadcasts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                {game.broadcasts.slice(0, 3).map((broadcast, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1" data-testid={`badge-broadcast-${i}`}>
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
          </div>
        </Link>

        {!compact && (
          <div className="px-4 pb-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" asChild data-testid={`button-tickets-${game.id}`}>
              <Link href={`/game/${game.id}/tickets`}>
                <Ticket className="h-3 w-3 mr-1" />
                Tickets
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild data-testid={`button-stats-${game.id}`}>
              <Link href={`/game/${game.id}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                Stats
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
});
