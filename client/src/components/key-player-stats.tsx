import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Users, Star, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerGameStats {
  id: string;
  name: string;
  position: string;
  team: string;
  teamId: string;
  headshot?: string;
  passingYards?: number;
  passingTouchdowns?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTouchdowns?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  receptions?: number;
  tackles?: number;
  sacks?: number;
}

interface KeyPlayerStatsProps {
  homePlayers: PlayerGameStats[];
  awayPlayers: PlayerGameStats[];
  homeTeamId: string;
  awayTeamId: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export function KeyPlayerStats({
  homePlayers,
  awayPlayers,
  homeTeamId,
  awayTeamId,
  homeTeamColor,
  awayTeamColor,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo
}: KeyPlayerStatsProps) {
  const renderPlayerStats = (player: PlayerGameStats, teamColor: string, isTop: boolean) => {
    const stats: { label: string; value: number | string }[] = [];
    
    if (player.passingYards !== undefined) {
      stats.push({ label: "PASS", value: `${player.passingYards} YDS` });
      if (player.passingTouchdowns) stats.push({ label: "TD", value: player.passingTouchdowns });
      if (player.interceptions) stats.push({ label: "INT", value: player.interceptions });
    }
    if (player.rushingYards !== undefined) {
      stats.push({ label: "RUSH", value: `${player.rushingYards} YDS` });
      if (player.rushingTouchdowns) stats.push({ label: "TD", value: player.rushingTouchdowns });
    }
    if (player.receivingYards !== undefined) {
      stats.push({ label: "REC", value: `${player.receivingYards} YDS` });
      if (player.receptions) stats.push({ label: "REC", value: player.receptions });
      if (player.receivingTouchdowns) stats.push({ label: "TD", value: player.receivingTouchdowns });
    }
    if (player.tackles !== undefined) {
      stats.push({ label: "TCKL", value: player.tackles });
      if (player.sacks) stats.push({ label: "SACK", value: player.sacks });
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative p-3 rounded-lg bg-muted/50",
          isTop && "ring-1 ring-amber-500/30"
        )}
        data-testid={`player-stats-${player.id}`}
      >
        {isTop && (
          <div className="absolute -top-2 -right-2">
            <div 
              className="p-1 rounded-full"
              style={{ backgroundColor: teamColor }}
            >
              <Star className="h-3 w-3 text-white fill-white" />
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {player.headshot ? (
            <img
              src={player.headshot}
              alt={player.name}
              className="w-10 h-10 rounded-full object-cover bg-muted"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: teamColor }}
            >
              {player.name.split(" ").map(n => n[0]).join("")}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{player.name}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {player.position}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {stats.slice(0, 4).map((stat, i) => (
                <span 
                  key={i}
                  className="text-[10px] text-muted-foreground"
                >
                  <span className="font-medium" style={{ color: teamColor }}>
                    {stat.value}
                  </span>
                  {" "}{stat.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTeamSection = (
    players: PlayerGameStats[], 
    teamName: string, 
    teamLogo: string, 
    teamColor: string,
    testId: string
  ) => (
    <div className="space-y-3" data-testid={testId}>
      <div className="flex items-center gap-2">
        <img src={teamLogo} alt={teamName} className="w-6 h-6 object-contain" />
        <span className="text-sm font-medium">{teamName}</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.length > 0 ? (
            players.slice(0, 3).map((player, index) => (
              <div key={player.id}>
                {renderPlayerStats(player, teamColor, index === 0)}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No stats available
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <Card data-testid="key-player-stats">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          Key Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {renderTeamSection(
            awayPlayers,
            awayTeamName,
            awayTeamLogo,
            awayTeamColor,
            "away-team-players"
          )}
          {renderTeamSection(
            homePlayers,
            homeTeamName,
            homeTeamLogo,
            homeTeamColor,
            "home-team-players"
          )}
        </div>

        {(homePlayers.length === 0 && awayPlayers.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 text-muted-foreground"
          >
            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Player stats will appear during the game</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
