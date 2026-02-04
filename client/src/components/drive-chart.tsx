import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Play } from "@shared/schema";

interface DriveChartProps {
  plays: Play[];
  currentYardLine: number;
  startYardLine: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeTeamName: string;
  awayTeamName: string;
  possession: string;
}

export function DriveChart({
  plays,
  currentYardLine,
  startYardLine,
  homeTeamId,
  awayTeamId,
  homeTeamColor,
  awayTeamColor,
  homeTeamName,
  awayTeamName,
  possession
}: DriveChartProps) {
  const isHomePossession = possession === homeTeamId;
  const possessionColor = isHomePossession ? homeTeamColor : awayTeamColor;
  const possessionTeam = isHomePossession ? homeTeamName : awayTeamName;
  
  const driveYards = currentYardLine - startYardLine;
  const isPositiveDrive = driveYards > 0;
  
  const drivePlays = plays.slice(-10);
  
  const startPosition = Math.min(Math.max((startYardLine / 100) * 100, 0), 100);
  const currentPosition = Math.min(Math.max((currentYardLine / 100) * 100, 0), 100);

  return (
    <Card data-testid="drive-chart">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: possessionColor + "20" }}
            >
              <MapPin className="h-4 w-4" style={{ color: possessionColor }} />
            </div>
            <span>Current Drive</span>
          </div>
          <Badge 
            variant="outline" 
            className="font-mono"
            data-testid="badge-drive-yards"
          >
            {drivePlays.length} plays, {isPositiveDrive ? "+" : ""}{driveYards} yds
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-16 rounded-lg overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-800 border border-border" data-testid="drive-field">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yard) => (
            <div
              key={yard}
              className="absolute top-0 bottom-0 w-px bg-white/15"
              style={{ left: `${yard}%` }}
            />
          ))}
          
          <div
            className="absolute top-0 bottom-0 w-[10%] flex items-center justify-center"
            style={{ left: 0, backgroundColor: awayTeamColor + "80" }}
          >
            <span className="text-white text-[8px] font-bold uppercase rotate-90 opacity-70">
              {awayTeamName.slice(0, 3)}
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-[10%] flex items-center justify-center"
            style={{ right: 0, backgroundColor: homeTeamColor + "80" }}
          >
            <span className="text-white text-[8px] font-bold uppercase -rotate-90 opacity-70">
              {homeTeamName.slice(0, 3)}
            </span>
          </div>

          <motion.div
            className="absolute top-2 bottom-2 opacity-40 rounded"
            style={{
              left: `${Math.min(startPosition, currentPosition) + 10}%`,
              width: `${Math.abs(currentPosition - startPosition)}%`,
              backgroundColor: isPositiveDrive ? "#22c55e" : "#ef4444",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.abs(currentPosition - startPosition)}%` }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
            style={{ left: `${startPosition + 10}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
          />

          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{ left: `calc(${currentPosition + 10}% - 6px)` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ 
                backgroundColor: possessionColor,
                boxShadow: `0 0 8px ${possessionColor}` 
              }}
            />
          </motion.div>

          <motion.div
            className="absolute top-0 bottom-0 w-0.5"
            style={{ 
              left: `${currentPosition + 10}%`,
              backgroundColor: possessionColor 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
          />

          <div className="absolute bottom-0 left-[10%] right-[10%] flex justify-between px-1 text-[7px] text-white/50 font-mono">
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50</span>
            <span>40</span>
            <span>30</span>
            <span>20</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Started: Own {startYardLine > 50 ? 100 - startYardLine : startYardLine}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3" style={{ color: possessionColor }} />
            <span className="font-medium" style={{ color: possessionColor }}>
              {possessionTeam} Ball
            </span>
          </div>
        </div>

        {drivePlays.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Play Sequence</div>
            <div className="flex flex-wrap gap-1">
              <AnimatePresence mode="popLayout">
                {drivePlays.map((play, index) => (
                  <motion.div
                    key={play.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono",
                        play.yards > 0 && "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
                        play.yards < 0 && "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
                        play.yards === 0 && "border-muted",
                        play.isScoring && "border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      )}
                      data-testid={`badge-play-${index}`}
                    >
                      {play.isScoring ? (
                        "TD"
                      ) : play.type === "pass" ? (
                        `P${play.yards > 0 ? "+" : ""}${play.yards}`
                      ) : play.type === "rush" ? (
                        `R${play.yards > 0 ? "+" : ""}${play.yards}`
                      ) : (
                        play.type.slice(0, 3).toUpperCase()
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold" data-testid="text-drive-plays">
              {drivePlays.length}
            </div>
            <div className="text-[10px] text-muted-foreground">Plays</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div 
              className={cn(
                "text-lg font-bold",
                isPositiveDrive ? "text-green-500" : "text-red-500"
              )}
              data-testid="text-drive-total-yards"
            >
              {isPositiveDrive ? "+" : ""}{driveYards}
            </div>
            <div className="text-[10px] text-muted-foreground">Yards</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold flex items-center justify-center gap-1" data-testid="text-drive-direction">
              {isPositiveDrive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">Direction</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
