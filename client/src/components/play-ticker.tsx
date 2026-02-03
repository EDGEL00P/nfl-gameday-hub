import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Play } from "@shared/schema";
import { 
  Zap, 
  Target, 
  ArrowRight, 
  Flag, 
  Clock, 
  Shield 
} from "lucide-react";

interface PlayTickerProps {
  plays: Play[];
  className?: string;
  maxPlays?: number;
}

const playTypeIcons: Record<string, typeof Zap> = {
  pass: ArrowRight,
  rush: Zap,
  touchdown: Target,
  field_goal: Target,
  punt: ArrowRight,
  kickoff: ArrowRight,
  penalty: Flag,
  timeout: Clock,
  turnover: Shield,
};

const playTypeColors: Record<string, string> = {
  touchdown: "bg-green-500/20 text-green-400 border-green-500/30",
  field_goal: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  penalty: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  turnover: "bg-red-500/20 text-red-400 border-red-500/30",
  timeout: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function PlayTicker({ plays, className, maxPlays = 5 }: PlayTickerProps) {
  const recentPlays = plays.slice(-maxPlays).reverse();

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {recentPlays.map((play, index) => {
          const Icon = playTypeIcons[play.type] || Zap;
          const colorClass = playTypeColors[play.type] || "";
          const isTouchdown = play.type === "touchdown";
          const uniqueKey = `${play.gameId || ''}-${play.id}-${index}`;

          return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, x: -50, height: 0 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                height: "auto",
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  delay: index * 0.05
                }
              }}
              exit={{ opacity: 0, x: 50, height: 0 }}
              className={cn(
                "relative p-3 rounded-lg border transition-all",
                isTouchdown ? "bg-green-500/10 border-green-500/30" : "bg-muted/50 border-border",
                index === 0 && "ring-1 ring-primary/20"
              )}
            >
              {isTouchdown && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 to-transparent"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative flex items-start gap-3">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  colorClass || "bg-muted"
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-[10px] uppercase", colorClass)}
                    >
                      {play.type.replace("_", " ")}
                    </Badge>
                    {play.quarter && (
                      <span className="text-xs text-muted-foreground">
                        Q{play.quarter} {play.time}
                      </span>
                    )}
                    {play.yards !== undefined && play.yards !== 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {play.yards > 0 ? `+${play.yards}` : play.yards} yds
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {play.description}
                  </p>
                </div>
              </div>

              {index === 0 && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-primary"
                  layoutId="activePlay"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {plays.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Waiting for plays...</p>
        </div>
      )}
    </div>
  );
}
