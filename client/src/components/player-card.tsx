import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp } from "lucide-react";
import type { NFLPlayer } from "@shared/schema";
import { motion } from "framer-motion";

interface PlayerCardProps {
  player: NFLPlayer;
  teamColor: string;
  compact?: boolean;
}

export const PlayerCard = memo(function PlayerCard({ player, teamColor, compact = false }: PlayerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "injured":
      case "ir":
        return "bg-red-500";
      case "questionable":
        return "bg-amber-500";
      case "doubtful":
        return "bg-orange-500";
      case "out":
        return "bg-red-600";
      case "pup":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "injured":
        return "Injured";
      case "ir":
        return "IR";
      case "questionable":
        return "Q";
      case "doubtful":
        return "D";
      case "out":
        return "Out";
      case "pup":
        return "PUP";
      default:
        return status;
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card
          className="p-3 hover-elevate cursor-pointer"
          data-testid={`player-card-${player.id}`}
        >
          <div className="flex items-center gap-3">
            {/* Headshot */}
            <div
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
              style={{ backgroundColor: teamColor + "20" }}
            >
              {player.headshot ? (
                <img
                  src={player.headshot}
                  alt={player.displayName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ color: teamColor }}>
                  {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold truncate">{player.displayName}</span>
                <span className="text-sm text-muted-foreground">#{player.jersey}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {player.position}
                </Badge>
                {player.status !== "active" && (
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(player.status))} />
                )}
              </div>
            </div>

            {/* Fantasy Points */}
            {player.fantasyPoints !== undefined && (
              <div className="text-right">
                <p className="text-sm font-bold text-green-500">{player.fantasyPoints.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">FP</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="overflow-hidden hover-elevate cursor-pointer"
        data-testid={`player-card-${player.id}`}
      >
        <div className="relative">
          {/* Header with team color */}
          <div
            className="h-16"
            style={{ background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}88 100%)` }}
          />

          {/* Headshot */}
          <div className="absolute top-6 left-4">
            <div
              className="w-20 h-20 rounded-xl overflow-hidden border-4 border-background shadow-lg"
              style={{ backgroundColor: teamColor + "20" }}
            >
              {player.headshot ? (
                <img
                  src={player.headshot}
                  alt={player.displayName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: teamColor }}>
                  {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Jersey Number */}
          <div className="absolute top-2 right-4 text-3xl font-black text-white/80">
            #{player.jersey}
          </div>
        </div>

        <div className="pt-8 p-4">
          {/* Name and Position */}
          <div className="mb-3">
            <h3 className="text-lg font-bold">{player.displayName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge style={{ backgroundColor: teamColor, color: "white" }}>
                {player.position}
              </Badge>
              {player.status !== "active" && (
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  player.status === "injured" || player.status === "ir" || player.status === "out" ? "border-red-500 text-red-500" : ""
                )}>
                  <AlertCircle className="h-3 w-3 mr-0.5" />
                  {getStatusLabel(player.status)}
                </Badge>
              )}
            </div>
          </div>

          {/* Player Details */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <p className="text-muted-foreground text-xs">Height</p>
              <p className="font-medium">{player.height}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Weight</p>
              <p className="font-medium">{player.weight} lbs</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Age</p>
              <p className="font-medium">{player.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Experience</p>
              <p className="font-medium">{player.experience} {player.experience === 1 ? "year" : "years"}</p>
            </div>
          </div>

          {/* College */}
          <p className="text-xs text-muted-foreground mb-3">
            College: {player.college}
          </p>

          {/* Injury Info */}
          {player.injury && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-3">
              <p className="text-xs font-medium text-red-500">
                {player.injury.type} - {player.injury.status}
              </p>
            </div>
          )}

          {/* Stats Preview */}
          {player.stats && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Season Stats</span>
                <span className="text-xs text-muted-foreground">{player.stats.gamesPlayed} GP</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {player.stats.passingYards !== undefined && (
                  <div className="text-center">
                    <p className="font-bold">{player.stats.passingYards}</p>
                    <p className="text-[10px] text-muted-foreground">Pass YDS</p>
                  </div>
                )}
                {player.stats.rushingYards !== undefined && (
                  <div className="text-center">
                    <p className="font-bold">{player.stats.rushingYards}</p>
                    <p className="text-[10px] text-muted-foreground">Rush YDS</p>
                  </div>
                )}
                {player.stats.receivingYards !== undefined && (
                  <div className="text-center">
                    <p className="font-bold">{player.stats.receivingYards}</p>
                    <p className="text-[10px] text-muted-foreground">Rec YDS</p>
                  </div>
                )}
                {player.stats.tackles !== undefined && (
                  <div className="text-center">
                    <p className="font-bold">{player.stats.tackles}</p>
                    <p className="text-[10px] text-muted-foreground">Tackles</p>
                  </div>
                )}
                {player.stats.sacks !== undefined && (
                  <div className="text-center">
                    <p className="font-bold">{player.stats.sacks}</p>
                    <p className="text-[10px] text-muted-foreground">Sacks</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fantasy Points */}
          {player.fantasyPoints !== undefined && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Fantasy Points
              </span>
              <span className="text-lg font-bold text-green-500">
                {player.fantasyPoints.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});
