import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface WinProbabilityProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamColor: string;
  awayTeamColor: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeWinProbability: number;
  isLive?: boolean;
}

export function WinProbability({
  homeTeamId,
  awayTeamId,
  homeTeamColor,
  awayTeamColor,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
  homeWinProbability,
  isLive = false
}: WinProbabilityProps) {
  const awayWinProbability = 100 - homeWinProbability;
  const homeIsWinning = homeWinProbability >= 50;

  return (
    <Card data-testid="win-probability">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          Win Probability
          {isLive && (
            <motion.div
              className="ml-auto h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" data-testid="away-team-probability">
            <img
              src={awayTeamLogo}
              alt={awayTeamName}
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-sm font-medium">{awayTeamName}</p>
              <motion.p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  !homeIsWinning && "text-foreground",
                  homeIsWinning && "text-muted-foreground"
                )}
                key={awayWinProbability}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {awayWinProbability.toFixed(1)}%
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-2" data-testid="home-team-probability">
            <div className="text-right">
              <p className="text-sm font-medium">{homeTeamName}</p>
              <motion.p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  homeIsWinning && "text-foreground",
                  !homeIsWinning && "text-muted-foreground"
                )}
                key={homeWinProbability}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {homeWinProbability.toFixed(1)}%
              </motion.p>
            </div>
            <img
              src={homeTeamLogo}
              alt={homeTeamName}
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        <div className="relative h-8 rounded-full overflow-hidden bg-muted" data-testid="probability-bar">
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center justify-start pl-2"
            style={{ backgroundColor: awayTeamColor }}
            initial={{ width: "50%" }}
            animate={{ width: `${awayWinProbability}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20,
              duration: 0.8
            }}
          >
            {awayWinProbability >= 20 && (
              <motion.span
                className="text-xs font-bold text-white opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: awayWinProbability >= 20 ? 0.8 : 0 }}
              >
                {awayWinProbability.toFixed(0)}%
              </motion.span>
            )}
          </motion.div>

          <motion.div
            className="absolute inset-y-0 right-0 flex items-center justify-end pr-2"
            style={{ backgroundColor: homeTeamColor }}
            initial={{ width: "50%" }}
            animate={{ width: `${homeWinProbability}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 20,
              duration: 0.8
            }}
          >
            {homeWinProbability >= 20 && (
              <motion.span
                className="text-xs font-bold text-white opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: homeWinProbability >= 20 ? 0.8 : 0 }}
              >
                {homeWinProbability.toFixed(0)}%
              </motion.span>
            )}
          </motion.div>

          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
            style={{ left: `${awayWinProbability}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Based on live game factors: score, time, possession, field position</span>
        </div>
      </CardContent>
    </Card>
  );
}
