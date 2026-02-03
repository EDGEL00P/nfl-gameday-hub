import { memo } from "react";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner = memo(function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOffline, wasOffline, retryCount, manualRetry } = useOfflineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-amber-500/10 border-b border-amber-500/20 overflow-hidden",
            className
          )}
          role="alert"
          aria-live="assertive"
          data-testid="offline-banner"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-2 text-sm">
            <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="text-amber-700 dark:text-amber-300">
              You're offline - showing cached data
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={manualRetry}
              className="h-7 px-2 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
              data-testid="button-retry-connection"
              aria-label="Retry connection"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", retryCount > 0 && "animate-spin")} aria-hidden="true" />
              Retry
            </Button>
          </div>
        </motion.div>
      )}
      
      {wasOffline && !isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-green-500/10 border-b border-green-500/20 overflow-hidden",
            className
          )}
          role="status"
          aria-live="polite"
          data-testid="reconnected-banner"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            <span className="text-green-700 dark:text-green-300">
              Back online - syncing latest data
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
