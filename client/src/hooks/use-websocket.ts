import { useState, useEffect, useCallback, useRef } from "react";
import type { NFLGame, Play } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data?: NFLGame[] | Play[];
  gameId?: string;
}

interface UseWebSocketReturn {
  games: NFLGame[];
  plays: Map<string, Play[]>;
  isConnected: boolean;
  subscribeToGame: (gameId: string) => void;
  requestPlays: (gameId: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [games, setGames] = useState<NFLGame[]>([]);
  const [plays, setPlays] = useState<Map<string, Play[]>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "games_update" && message.data) {
            setGames(message.data as NFLGame[]);
          }

          if (message.type === "plays_update" && message.gameId && message.data) {
            setPlays((prev) => {
              const newPlays = new Map(prev);
              const existingPlays = newPlays.get(message.gameId!) || [];
              const newPlayData = message.data as Play[];
              const mergedPlays = [...existingPlays];
              
              newPlayData.forEach((play) => {
                if (!mergedPlays.some((p) => p.id === play.id)) {
                  mergedPlays.push(play);
                }
              });
              
              newPlays.set(message.gameId!, mergedPlays.slice(-50));
              return newPlays;
            });
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      socket.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        wsRef.current = null;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[WebSocket] Attempting reconnection...");
          connect();
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      wsRef.current = socket;
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribeToGame = useCallback((gameId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe_game", gameId }));
    }
  }, []);

  const requestPlays = useCallback((gameId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "request_plays", gameId }));
    }
  }, []);

  return {
    games,
    plays,
    isConnected,
    subscribeToGame,
    requestPlays,
  };
}
