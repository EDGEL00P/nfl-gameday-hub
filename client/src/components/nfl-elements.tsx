import { cn } from "@/lib/utils";

interface HelmetProps {
  teamColor: string;
  alternateColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  facingRight?: boolean;
}

export function Helmet({ 
  teamColor, 
  alternateColor, 
  size = "md", 
  className,
  facingRight = false 
}: HelmetProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(sizeClasses[size], facingRight && "scale-x-[-1]", className)}
      data-testid="icon-helmet"
    >
      <defs>
        <linearGradient id={`helmet-gradient-${teamColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={teamColor} />
          <stop offset="100%" stopColor={alternateColor || teamColor} />
        </linearGradient>
      </defs>
      <path
        d="M52 28c0-13.255-10.745-24-24-24S4 14.745 4 28c0 6.627 2.686 12.627 7.029 16.971L8 52l8-4c4 4 12 8 20 8 13.255 0 24-10.745 24-24z"
        fill={`url(#helmet-gradient-${teamColor.replace('#', '')})`}
        stroke={alternateColor || "#000"}
        strokeWidth="2"
      />
      <path
        d="M14 28c0-8.837 7.163-16 16-16"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx="18"
        cy="32"
        rx="6"
        ry="10"
        fill="rgba(0,0,0,0.2)"
      />
      <rect
        x="8"
        y="26"
        width="12"
        height="2"
        rx="1"
        fill={alternateColor || "#ccc"}
      />
      <rect
        x="8"
        y="30"
        width="12"
        height="2"
        rx="1"
        fill={alternateColor || "#ccc"}
      />
      <rect
        x="8"
        y="34"
        width="12"
        height="2"
        rx="1"
        fill={alternateColor || "#ccc"}
      />
    </svg>
  );
}

interface FootballProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  spinning?: boolean;
}

export function Football({ size = "md", className, spinning = false }: FootballProps) {
  const sizeClasses = {
    sm: "w-4 h-3",
    md: "w-8 h-5",
    lg: "w-12 h-8"
  };

  return (
    <svg
      viewBox="0 0 40 24"
      className={cn(
        sizeClasses[size], 
        spinning && "animate-spin",
        className
      )}
      data-testid="icon-football"
    >
      <ellipse
        cx="20"
        cy="12"
        rx="18"
        ry="10"
        fill="#8B4513"
        stroke="#5D3A1A"
        strokeWidth="1"
      />
      <path
        d="M20 4 L20 20"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M16 7 L24 7 M16 10 L24 10 M16 14 L24 14 M16 17 L24 17"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface GoalPostProps {
  className?: string;
  highlighted?: boolean;
}

export function GoalPost({ className, highlighted = false }: GoalPostProps) {
  return (
    <svg
      viewBox="0 0 60 80"
      className={cn("w-12 h-16", className)}
      data-testid="icon-goalpost"
    >
      <rect x="28" y="30" width="4" height="50" fill={highlighted ? "#FFD700" : "#FFB81C"} />
      <rect x="8" y="20" width="4" height="40" fill={highlighted ? "#FFD700" : "#FFB81C"} />
      <rect x="48" y="20" width="4" height="40" fill={highlighted ? "#FFD700" : "#FFB81C"} />
      <rect x="8" y="16" width="44" height="6" fill={highlighted ? "#FFD700" : "#FFB81C"} />
    </svg>
  );
}

interface DownMarkerProps {
  down: number;
  className?: string;
}

export function DownMarker({ down, className }: DownMarkerProps) {
  const ordinal = ["1ST", "2ND", "3RD", "4TH"][down - 1] || `${down}TH`;
  
  return (
    <div 
      className={cn(
        "relative w-8 h-10 flex items-center justify-center",
        className
      )}
      data-testid="marker-down"
    >
      <svg viewBox="0 0 32 40" className="absolute inset-0 w-full h-full">
        <path
          d="M4 4 L28 4 L28 32 L16 38 L4 32 Z"
          fill="#FF6B00"
          stroke="#000"
          strokeWidth="2"
        />
      </svg>
      <span className="relative z-10 text-white font-black text-xs">
        {ordinal}
      </span>
    </div>
  );
}

interface YardLineProps {
  yard: number;
  isRedZone?: boolean;
  className?: string;
}

export function YardLine({ yard, isRedZone = false, className }: YardLineProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-0.5",
        className
      )}
      data-testid={`yardline-${yard}`}
    >
      <div 
        className={cn(
          "w-px h-4",
          isRedZone ? "bg-red-500" : "bg-white/60"
        )}
      />
      <span 
        className={cn(
          "text-[8px] font-bold",
          isRedZone ? "text-red-400" : "text-white/60"
        )}
      >
        {yard === 50 ? "50" : yard > 50 ? 100 - yard : yard}
      </span>
    </div>
  );
}

interface EndZoneProps {
  teamName: string;
  teamColor: string;
  side: "left" | "right";
  className?: string;
}

export function EndZone({ teamName, teamColor, side, className }: EndZoneProps) {
  return (
    <div 
      className={cn(
        "h-full flex items-center justify-center px-2",
        side === "left" ? "rounded-l-lg" : "rounded-r-lg",
        className
      )}
      style={{ backgroundColor: teamColor }}
      data-testid={`endzone-${side}`}
    >
      <span 
        className={cn(
          "font-black text-white text-xs uppercase tracking-widest",
          side === "left" ? "-rotate-90" : "rotate-90"
        )}
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
      >
        {teamName}
      </span>
    </div>
  );
}

interface ChainMarkerProps {
  yardsToGo: number;
  className?: string;
}

export function ChainMarker({ yardsToGo, className }: ChainMarkerProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded bg-orange-500 text-white font-bold text-xs",
        className
      )}
      data-testid="marker-chain"
    >
      <Football size="sm" />
      <span>{yardsToGo} TO GO</span>
    </div>
  );
}

interface TrophyProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  glowing?: boolean;
}

export function LombardTrophy({ size = "md", className, glowing = false }: TrophyProps) {
  const sizeClasses = {
    sm: "w-8 h-12",
    md: "w-12 h-18",
    lg: "w-20 h-28"
  };

  return (
    <svg
      viewBox="0 0 48 72"
      className={cn(
        sizeClasses[size],
        glowing && "drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]",
        className
      )}
      data-testid="icon-trophy"
    >
      <defs>
        <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <rect x="18" y="50" width="12" height="16" fill="url(#trophy-gold)" />
      <rect x="12" y="64" width="24" height="6" rx="1" fill="url(#trophy-gold)" />
      <ellipse cx="24" cy="30" rx="20" ry="10" fill="none" stroke="url(#trophy-gold)" strokeWidth="4" />
      <path
        d="M24 20 L24 50"
        stroke="url(#trophy-gold)"
        strokeWidth="4"
      />
      <ellipse cx="24" cy="18" rx="4" ry="6" fill="url(#trophy-gold)" />
    </svg>
  );
}

interface NFLShieldProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function NFLShield({ size = "md", className }: NFLShieldProps) {
  const sizeClasses = {
    sm: "w-6 h-8",
    md: "w-10 h-12",
    lg: "w-16 h-20"
  };

  return (
    <svg
      viewBox="0 0 40 52"
      className={cn(sizeClasses[size], className)}
      data-testid="icon-nfl-shield"
    >
      <path
        d="M20 2 L38 10 L38 28 C38 40 20 50 20 50 C20 50 2 40 2 28 L2 10 Z"
        fill="#013369"
        stroke="#D50A0A"
        strokeWidth="2"
      />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fill="white"
        fontWeight="bold"
        fontSize="10"
      >
        NFL
      </text>
      <path
        d="M10 34 L30 34"
        stroke="#D50A0A"
        strokeWidth="2"
      />
      <circle cx="14" cy="18" r="3" fill="white" opacity="0.3" />
      <circle cx="26" cy="18" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

interface StadiumIconProps {
  className?: string;
}

export function StadiumIcon({ className }: StadiumIconProps) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={cn("w-16 h-10", className)}
      data-testid="icon-stadium"
    >
      <ellipse cx="32" cy="30" rx="30" ry="8" fill="#333" opacity="0.3" />
      <path
        d="M4 28 Q4 12 32 12 Q60 12 60 28"
        fill="#444"
        stroke="#666"
        strokeWidth="1"
      />
      <rect x="8" y="20" width="48" height="10" fill="#2d5016" />
      <path
        d="M8 20 L56 20"
        stroke="white"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

interface ScoreboardProps {
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  homeColor: string;
  awayColor: string;
  className?: string;
}

export function Scoreboard({
  homeScore,
  awayScore,
  quarter,
  timeRemaining,
  homeColor,
  awayColor,
  className
}: ScoreboardProps) {
  return (
    <div 
      className={cn(
        "bg-black rounded-lg p-3 border-2 border-amber-500/50",
        className
      )}
      style={{
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(255,193,7,0.2)"
      }}
      data-testid="scoreboard"
    >
      <div className="flex items-center justify-between gap-4">
        <div 
          className="text-3xl font-black text-white font-mono"
          style={{ textShadow: `0 0 10px ${awayColor}` }}
        >
          {String(awayScore).padStart(2, "0")}
        </div>
        <div className="flex flex-col items-center">
          <div className="text-amber-400 text-xs font-bold">Q{quarter}</div>
          <div className="text-white text-sm font-mono">{timeRemaining}</div>
        </div>
        <div 
          className="text-3xl font-black text-white font-mono"
          style={{ textShadow: `0 0 10px ${homeColor}` }}
        >
          {String(homeScore).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
