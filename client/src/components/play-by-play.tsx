import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  MoveRight, 
  Target, 
  Flag, 
  Timer, 
  AlertTriangle,
  Zap,
  TrendingUp
} from "lucide-react";
import type { Play } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface PlayByPlayProps {
  plays: Play[];
  homeTeamId: string;
  awayTeamId: string;
  homeTeamColor: string;
  awayTeamColor: string;
}

export function PlayByPlay({ 
  plays, 
  homeTeamId, 
  awayTeamId, 
  homeTeamColor, 
  awayTeamColor 
}: PlayByPlayProps) {
  const getPlayIcon = (type: string) => {
    switch (type) {
      case "rush":
        return <MoveRight className="h-4 w-4" />;
      case "pass":
        return <Target className="h-4 w-4" />;
      case "penalty":
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case "timeout":
        return <Timer className="h-4 w-4" />;
      case "touchdown":
        return <Zap className="h-4 w-4 text-green-500" />;
      case "turnover":
      case "interception":
      case "fumble":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTeamColor = (teamId: string) => {
    return teamId === homeTeamId ? homeTeamColor : awayTeamColor;
  };

  return (
    <Card className="h-full" data-testid="play-by-play">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Play-by-Play
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-4 pb-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {plays.map((play, index) => (
                <motion.div
                  key={play.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative pl-4 py-3 rounded-lg transition-colors",
                    play.isScoring && "bg-green-500/10 border border-green-500/20",
                    play.isTurnover && "bg-red-500/10 border border-red-500/20",
                    play.isBigPlay && !play.isScoring && "bg-amber-500/10 border border-amber-500/20",
                    !play.isScoring && !play.isTurnover && !play.isBigPlay && "bg-muted/50 hover:bg-muted"
                  )}
                >
                  {/* Team indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: getTeamColor(play.team) }}
                  />
                  
                  {/* Play header */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono">Q{play.quarter}</span>
                      <span className="mx-0.5">|</span>
                      <span className="font-mono">{play.time}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono h-5">
                      {play.down > 0 && `${play.down}${getOrdinal(play.down)} & ${play.distance}`}
                    </Badge>
                    {play.isScoring && (
                      <Badge className="bg-green-500 text-white text-[10px] h-5">
                        SCORE
                      </Badge>
                    )}
                    {play.isBigPlay && !play.isScoring && (
                      <Badge className="bg-amber-500 text-white text-[10px] h-5">
                        BIG PLAY
                      </Badge>
                    )}
                  </div>

                  {/* Play description */}
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 p-1.5 rounded-md bg-background">
                      {getPlayIcon(play.type)}
                    </div>
                    <p className="text-sm leading-relaxed flex-1">
                      {play.description}
                    </p>
                    {play.yards !== 0 && (
                      <span className={cn(
                        "font-semibold text-sm shrink-0",
                        play.yards > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {play.yards > 0 ? "+" : ""}{play.yards} YDS
                      </span>
                    )}
                  </div>

                  {/* Players involved */}
                  {play.players.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {play.players.slice(0, 3).map((player, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {player.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {plays.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No plays yet</p>
                <p className="text-sm">Plays will appear here once the game starts</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
