import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Zap, Target, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Play } from "@shared/schema";

interface ScoringPlay {
  id: string;
  quarter: number;
  time: string;
  team: string;
  teamColor: string;
  teamName: string;
  teamLogo: string;
  type: string;
  description: string;
  homeScore: number;
  awayScore: number;
}

interface ScoringSummaryProps {
  scoringPlays: ScoringPlay[];
  homeTeamId: string;
  awayTeamId: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export function ScoringSummary({
  scoringPlays,
  homeTeamId,
  awayTeamId,
  homeTeamColor,
  awayTeamColor,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo
}: ScoringSummaryProps) {
  const getPlayIcon = (type: string) => {
    switch (type) {
      case "touchdown":
        return <Zap className="h-4 w-4" />;
      case "field_goal":
        return <Target className="h-4 w-4" />;
      case "safety":
        return <Shield className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPlayLabel = (type: string) => {
    switch (type) {
      case "touchdown":
        return "TD";
      case "field_goal":
        return "FG";
      case "extra_point":
        return "XP";
      case "two_point":
        return "2PT";
      case "safety":
        return "SAF";
      default:
        return "SCORE";
    }
  };

  return (
    <Card data-testid="scoring-summary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          Scoring Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-4 pb-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {scoringPlays.length > 0 ? (
                scoringPlays.map((play, index) => {
                  const isHomeTeam = play.team === homeTeamId;
                  const teamColor = isHomeTeam ? homeTeamColor : awayTeamColor;
                  const teamName = isHomeTeam ? homeTeamName : awayTeamName;
                  const teamLogo = isHomeTeam ? homeTeamLogo : awayTeamLogo;

                  return (
                    <motion.div
                      key={play.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className="relative pl-3 py-3 rounded-lg bg-muted/50 hover-elevate"
                      data-testid={`scoring-play-${play.id}`}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                        style={{ backgroundColor: teamColor }}
                      />

                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <img
                            src={teamLogo}
                            alt={teamName}
                            className="w-8 h-8 object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              className="text-[10px] font-bold text-white"
                              style={{ backgroundColor: teamColor }}
                            >
                              {getPlayLabel(play.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              Q{play.quarter} {play.time}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed line-clamp-2">
                            {play.description}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                            <span className="text-muted-foreground">Score:</span>
                            <span className={cn(
                              isHomeTeam ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {awayTeamName} {play.awayScore}
                            </span>
                            <span className="text-muted-foreground">-</span>
                            <span className={cn(
                              !isHomeTeam ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {homeTeamName} {play.homeScore}
                            </span>
                          </div>
                        </div>

                        <div 
                          className="shrink-0 p-2 rounded-full"
                          style={{ backgroundColor: teamColor + "20" }}
                        >
                          {getPlayIcon(play.type)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No scoring plays yet</p>
                  <p className="text-xs mt-1">Scores will appear here as they happen</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
