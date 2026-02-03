import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FieldVisualizationProps {
  ballPosition: number; // 0-100 (0 = away end zone, 100 = home end zone)
  homeTeamColor: string;
  awayTeamColor: string;
  homeTeamName: string;
  awayTeamName: string;
  down?: number;
  distance?: number;
  possession: "home" | "away";
  driveStartYardLine?: number;
  firstDownLine?: number;
  redZone?: boolean;
}

export function FieldVisualization({
  ballPosition,
  homeTeamColor,
  awayTeamColor,
  homeTeamName,
  awayTeamName,
  down = 0,
  distance = 0,
  possession,
  driveStartYardLine,
  firstDownLine,
  redZone = false,
}: FieldVisualizationProps) {
  // Convert field position to display position (flip for away team drives)
  const displayPosition = ballPosition;
  const firstDownDisplayPosition = firstDownLine || Math.min(ballPosition + distance, 100);

  return (
    <div className="relative w-full" data-testid="field-visualization">
      {/* Field container */}
      <div className="relative h-24 rounded-lg overflow-hidden border border-border bg-gradient-to-r from-green-800 via-green-700 to-green-800">
        {/* Yard lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 border-r border-white/20",
                i === 0 && "border-l"
              )}
            >
              {/* Hash marks */}
              <div className="absolute top-1/3 left-0 w-full h-px bg-white/30" />
              <div className="absolute top-2/3 left-0 w-full h-px bg-white/30" />
            </div>
          ))}
        </div>

        {/* End zones */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[9%] flex items-center justify-center"
          style={{ backgroundColor: awayTeamColor + "90" }}
        >
          <span className="text-white text-[10px] font-bold uppercase tracking-wider rotate-90 whitespace-nowrap opacity-80">
            {awayTeamName}
          </span>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-[9%] flex items-center justify-center"
          style={{ backgroundColor: homeTeamColor + "90" }}
        >
          <span className="text-white text-[10px] font-bold uppercase tracking-wider -rotate-90 whitespace-nowrap opacity-80">
            {homeTeamName}
          </span>
        </div>

        {/* Yard markers */}
        <div className="absolute bottom-0 left-[9%] right-[9%] flex justify-between px-1 text-[8px] text-white/60 font-mono">
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

        {/* Red zone indicator */}
        {redZone && (
          <>
            <div className="absolute left-[9%] top-0 bottom-0 w-[18%] bg-red-500/20" />
            <div className="absolute right-[9%] top-0 bottom-0 w-[18%] bg-red-500/20" />
          </>
        )}

        {/* First down line */}
        {firstDownLine !== undefined && down > 0 && (
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
            style={{ left: `${9 + (firstDownDisplayPosition * 0.82)}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Drive start marker */}
        {driveStartYardLine !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400/50"
            style={{ left: `${9 + (driveStartYardLine * 0.82)}%` }}
          />
        )}

        {/* Ball position */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: `${9 + (displayPosition * 0.82)}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div
            className={cn(
              "relative w-4 h-4 rounded-full border-2 border-white shadow-lg",
              possession === "home" ? "bg-amber-500" : "bg-amber-500"
            )}
            style={{ boxShadow: `0 0 12px ${possession === "home" ? homeTeamColor : awayTeamColor}` }}
          >
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
          </div>
        </motion.div>

        {/* Line of scrimmage */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
          style={{ left: `${9 + (displayPosition * 0.82)}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
        />
      </div>

      {/* Down and distance indicator */}
      {down > 0 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
            {down}{getOrdinal(down)} & {distance}
          </div>
          <div className="text-sm text-muted-foreground">
            Ball on {ballPosition > 50 ? `${homeTeamName} ${100 - ballPosition}` : `${awayTeamName} ${ballPosition}`}
          </div>
        </div>
      )}
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
