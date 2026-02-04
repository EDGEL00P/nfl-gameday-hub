import { useState, useEffect, useCallback } from "react";

interface OfflineStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  autoRetryInterval?: number;
}

export function useOfflineStatus(options: OfflineStatusOptions = {}) {
  const { onOnline, onOffline, autoRetryInterval = 30000 } = options;
  
  const [isOffline, setIsOffline] = useState(() => 
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    setWasOffline(true);
    setRetryCount(0);
    onOnline?.();
    
    setTimeout(() => setWasOffline(false), 3000);
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    onOffline?.();
  }, [onOffline]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/health", { 
        method: "HEAD",
        cache: "no-store"
      });
      if (response.ok && isOffline) {
        handleOnline();
        return true;
      }
      return response.ok;
    } catch {
      if (!isOffline) {
        handleOffline();
      }
      return false;
    }
  }, [isOffline, handleOnline, handleOffline]);

  const manualRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    return checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  useEffect(() => {
    if (!isOffline || autoRetryInterval <= 0) return;

    const interval = setInterval(() => {
      checkConnection();
    }, autoRetryInterval);

    return () => clearInterval(interval);
  }, [isOffline, autoRetryInterval, checkConnection]);

  return {
    isOffline,
    wasOffline,
    retryCount,
    manualRetry,
    checkConnection
  };
}
