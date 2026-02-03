import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/live-indicator";
import { cn } from "@/lib/utils";
import { ChevronRight, Tv, Radio, Ticket } from "lucide-react";
import { Link } from "wouter";
import type { NFLGame } from "@shared/schema";
import { motion } from "framer-motion";

interface GameCardProps {
  game: NFLGame;
  compact?: boolean;
}

export const GameCard = memo(function GameCard({ game, compact = false }: GameCardProps) {
  const isLive = game.status === "in_progress" || game.status === "halftime";
  const isFinal = game.status === "final";
  const isScheduled = game.status === "scheduled" || game.status === "pregame";
  
  const homeWinning = game.homeScore > game.awayScore;
  const awayWinning = game.awayScore > game.homeScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover-elevate",
          isLive && "ring-2 ring-red-500/50 shadow-lg shadow-red-500/10"
        )}
        data-testid={`game-card-${game.id}`}
      >
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        )}

        <Link href={`/game/${game.id}`}>
          <div className={cn("p-4 cursor-pointer", compact && "p-3")}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isLive && <LiveIndicator size="sm" />}
                {isFinal && (
                  <Badge variant="secondary" className="text-[10px]">
                    FINAL
                  </Badge>
                )}
                {isScheduled && (
                  <span className="text-xs text-muted-foreground">
                    {game.time}
                  </span>
                )}
              </div>
              {isLive && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-medium">Q{game.quarter}</span>
                  <span className="mx-1">|</span>
                  <span>{game.timeRemaining}</span>
                </div>
              )}
            </div>

            {/* Teams */}
            <div className="space-y-3">
              {/* Away Team */}
              <div className={cn(
                "flex items-center gap-3 transition-opacity",
                isFinal && !awayWinning && "opacity-60"
              )}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: game.awayTeam.color + "20" }}
                >
                  <img
                    src={game.awayTeam.logo}
                    alt={game.awayTeam.name}
                    className="w-8 h-8 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    awayWinning && (isLive || isFinal) && "text-foreground"
                  )}>
                    {game.awayTeam.shortDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {game.awayTeam.record?.wins || 0}-{game.awayTeam.record?.losses || 0}
                  </p>
                </div>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  awayWinning && (isLive || isFinal) && "text-foreground",
                  !awayWinning && (isLive || isFinal) && "text-muted-foreground"
                )}>
                  {game.awayScore}
                </div>
                {game.possession === game.awayTeam.id && isLive && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>

              {/* Home Team */}
              <div className={cn(
                "flex items-center gap-3 transition-opacity",
                isFinal && !homeWinning && "opacity-60"
              )}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: game.homeTeam.color + "20" }}
                >
                  <img
                    src={game.homeTeam.logo}
                    alt={game.homeTeam.name}
                    className="w-8 h-8 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold truncate",
                    homeWinning && (isLive || isFinal) && "text-foreground"
                  )}>
                    {game.homeTeam.shortDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {game.homeTeam.record?.wins || 0}-{game.homeTeam.record?.losses || 0}
                  </p>
                </div>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  homeWinning && (isLive || isFinal) && "text-foreground",
                  !homeWinning && (isLive || isFinal) && "text-muted-foreground"
                )}>
                  {game.homeScore}
                </div>
                {game.possession === game.homeTeam.id && isLive && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
            </div>

            {/* Live Game Info */}
            {isLive && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {game.down > 0 ? `${game.down}${getOrdinal(game.down)} & ${game.distance}` : ""}
                    </Badge>
                    {game.redZone && (
                      <Badge variant="destructive" className="text-[10px]">
                        RED ZONE
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    Ball on {game.yardLine}
                  </span>
                </div>
              </div>
            )}

            {/* Broadcast Info */}
            {!compact && game.broadcasts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                {game.broadcasts.slice(0, 3).map((broadcast, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] gap-1">
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

        {/* Quick Actions */}
        {!compact && (
          <div className="px-4 pb-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
              <Link href={`/game/${game.id}/tickets`}>
                <Ticket className="h-3 w-3 mr-1" />
                Tickets
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/game/${game.id}`}>
                Details
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
});

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
