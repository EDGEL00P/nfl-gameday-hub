import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate?: Date;
  className?: string;
}

export function ConnectionStatus({ 
  isConnected, 
  lastUpdate, 
  className 
}: ConnectionStatusProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
        isConnected 
          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
          : "bg-red-500/10 text-red-500 border border-red-500/20",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-testid="connection-status"
    >
      <motion.div
        animate={isConnected ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
      </motion.div>
      
      <span className="font-medium">
        {isConnected ? "Live" : "Reconnecting..."}
      </span>
      
      {isConnected && lastUpdate && (
        <>
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <RefreshCw className="h-2.5 w-2.5 connection-pulse" />
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
