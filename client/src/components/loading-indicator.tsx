import { memo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingIndicatorProps {
  isLoading: boolean;
  className?: string;
}

export const GlobalLoadingIndicator = memo(function GlobalLoadingIndicator({ 
  isLoading, 
  className 
}: LoadingIndicatorProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 overflow-hidden",
            className
          )}
          role="progressbar"
          aria-label="Loading"
          aria-busy="true"
          data-testid="global-loading-indicator"
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "linear"
            }}
            style={{ width: "50%" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

interface PageLoaderProps {
  className?: string;
}

export const PageLoader = memo(function PageLoader({ className }: PageLoaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] gap-4",
        className
      )}
      role="status"
      aria-label="Loading page content"
      data-testid="page-loader"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
});

interface InlineLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const InlineLoader = memo(function InlineLoader({ 
  size = "md", 
  className,
  label = "Loading"
}: InlineLoaderProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6"
  };

  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-label={label}
    >
      <Loader2 
        className={cn("animate-spin text-muted-foreground", sizeClasses[size])} 
        aria-hidden="true" 
      />
      <span className="sr-only">{label}</span>
    </div>
  );
});

interface SuspenseFallbackProps {
  variant?: "page" | "card" | "inline";
  className?: string;
}

export const SuspenseFallback = memo(function SuspenseFallback({ 
  variant = "page",
  className 
}: SuspenseFallbackProps) {
  if (variant === "inline") {
    return <InlineLoader className={className} />;
  }

  if (variant === "card") {
    return (
      <div 
        className={cn(
          "flex items-center justify-center p-8",
          className
        )}
        role="status"
        aria-label="Loading content"
        data-testid="suspense-fallback-card"
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return <PageLoader className={className} />;
});
