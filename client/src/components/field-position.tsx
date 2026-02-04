import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FieldPositionProps {
  yardLine: number;
  possession: string;
  homeTeamId: string;
  awayTeamId: string;
  homeColor: string;
  awayColor: string;
  redZone?: boolean;
  className?: string;
}

export function FieldPosition({
  yardLine,
  possession,
  homeTeamId,
  awayTeamId,
  homeColor,
  awayColor,
  redZone = false,
  className
}: FieldPositionProps) {
  const isHomePossession = possession === homeTeamId;
  const ballPosition = ((yardLine / 100) * 100);
  const possessionColor = isHomePossession ? homeColor : awayColor;

  return (
    <div className={cn("relative", className)}>
      <div className="h-8 rounded-lg overflow-hidden field-gradient relative">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yard) => (
          <div
            key={yard}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${yard}%` }}
          />
        ))}

        <div
          className="absolute top-0 bottom-0 w-px bg-white/40 font-bold text-[8px] text-white"
          style={{ left: "50%" }}
        >
          <span className="absolute -top-4 left-1/2 -translate-x-1/2">50</span>
        </div>

        {redZone && (
          <motion.div
            className="absolute top-0 bottom-0 bg-red-500/30"
            style={{ 
              left: isHomePossession ? "80%" : "0%",
              width: "20%"
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <motion.div
          className="absolute top-1 bottom-1 w-3 rounded-full"
          style={{ backgroundColor: possessionColor }}
          initial={{ left: "50%" }}
          animate={{ 
            left: `${ballPosition}%`,
            boxShadow: `0 0 10px ${possessionColor}80, 0 0 20px ${possessionColor}40`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        <div 
          className="absolute top-0 bottom-0 w-2 rounded-l-lg"
          style={{ left: 0, backgroundColor: awayColor }}
        />
        <div 
          className="absolute top-0 bottom-0 w-2 rounded-r-lg"
          style={{ right: 0, backgroundColor: homeColor }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground px-1">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}
