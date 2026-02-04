import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, MapPin, Users, Trophy, Calendar } from "lucide-react";
import type { NFLTeam } from "@shared/schema";
import { motion } from "framer-motion";

interface TeamHeaderProps {
  team: NFLTeam;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function TeamHeader({ team, isFavorite = false, onToggleFavorite }: TeamHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="overflow-hidden border-0"
        style={{
          background: `linear-gradient(135deg, ${team.color}22 0%, ${team.alternateColor}22 100%)`,
        }}
        data-testid={`team-header-${team.id}`}
      >
        <div className="relative p-6 md:p-8">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url(${team.logo})`,
              backgroundSize: "200px",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Team Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl shadow-xl flex items-center justify-center"
              style={{ backgroundColor: team.color + "20" }}
            >
              <img
                src={team.logo}
                alt={team.name}
                className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg"
                loading="lazy"
              />
            </motion.div>

            {/* Team Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{team.displayName}</h1>
                <div className="flex gap-2">
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.conference}
                  </Badge>
                  <Badge variant="secondary">{team.division}</Badge>
                </div>
              </div>

              {/* Record */}
              {team.record && (
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{team.record.wins}</p>
                    <p className="text-xs text-muted-foreground uppercase">Wins</p>
                  </div>
                  <div className="text-2xl text-muted-foreground">-</div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{team.record.losses}</p>
                    <p className="text-xs text-muted-foreground uppercase">Losses</p>
                  </div>
                  {team.record.ties > 0 && (
                    <>
                      <div className="text-2xl text-muted-foreground">-</div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{team.record.ties}</p>
                        <p className="text-xs text-muted-foreground uppercase">Ties</p>
                      </div>
                    </>
                  )}
                  <div className="h-8 w-px bg-border mx-2" />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {team.record.streak}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Stadium Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {team.stadium.name}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {team.stadium.capacity.toLocaleString()} capacity
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorite}
                className={cn(
                  "gap-1",
                  isFavorite && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
                data-testid="button-favorite-team"
              >
                <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {team.record && (
            <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold">{team.record.conferenceRecord}</p>
                <p className="text-xs text-muted-foreground">Conference</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{team.record.divisionRecord}</p>
                <p className="text-xs text-muted-foreground">Division</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{team.record.pointsFor}</p>
                <p className="text-xs text-muted-foreground">Points For</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{team.record.pointsAgainst}</p>
                <p className="text-xs text-muted-foreground">Points Against</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
