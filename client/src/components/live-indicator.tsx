import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function LiveIndicator({ className, size = "md", showText = true }: LiveIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const textSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75",
            sizeClasses[size]
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full bg-red-500",
            sizeClasses[size]
          )}
        />
      </span>
      {showText && (
        <span className={cn("font-semibold text-red-500 uppercase tracking-wide", textSizeClasses[size])}>
          Live
        </span>
      )}
    </div>
  );
}
