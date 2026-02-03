import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedScoreProps {
  score: number;
  isWinning?: boolean;
  isLive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  teamColor?: string;
}

export function AnimatedScore({ 
  score, 
  isWinning = false, 
  isLive = false,
  size = "lg",
  teamColor
}: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevScoreRef = useRef(score);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (score !== prevScoreRef.current) {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      
      setIsAnimating(true);
      
      const scoreDiff = score - prevScoreRef.current;
      const steps = Math.min(Math.abs(scoreDiff), 10);
      const stepDelay = 50;
      
      for (let i = 1; i <= steps; i++) {
        const timer = setTimeout(() => {
          setDisplayScore(prev => prev + Math.sign(scoreDiff));
        }, i * stepDelay);
        timersRef.current.push(timer);
      }
      
      const finalTimer = setTimeout(() => {
        setDisplayScore(score);
        setIsAnimating(false);
      }, (steps + 1) * stepDelay);
      timersRef.current.push(finalTimer);
      
      prevScoreRef.current = score;
    }
  }, [score]);

  return (
    <motion.div
      className={cn(
        "relative font-bold tabular-nums",
        sizeClasses[size],
        isWinning && "text-foreground",
        !isWinning && "text-muted-foreground"
      )}
      animate={isAnimating ? {
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      } : {}}
      data-testid="score-animated"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayScore}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }}
          style={teamColor && isWinning ? { 
            textShadow: `0 0 15px ${teamColor}50` 
          } : undefined}
        >
          {displayScore}
        </motion.span>
      </AnimatePresence>
      
      {isAnimating && isLive && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [1, 1.3, 1.5]
          }}
          transition={{ duration: 0.5 }}
          style={{ 
            backgroundColor: teamColor || "#22c55e",
            filter: "blur(8px)"
          }}
        />
      )}
    </motion.div>
  );
}
