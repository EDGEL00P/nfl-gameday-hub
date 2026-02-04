import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface FavoritesContextType {
  favoriteTeams: string[];
  favoritePlayers: string[];
  addFavoriteTeam: (teamId: string) => void;
  removeFavoriteTeam: (teamId: string) => void;
  toggleFavoriteTeam: (teamId: string) => void;
  isFavoriteTeam: (teamId: string) => boolean;
  addFavoritePlayer: (playerId: string) => void;
  removeFavoritePlayer: (playerId: string) => void;
  toggleFavoritePlayer: (playerId: string) => void;
  isFavoritePlayer: (playerId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_TEAMS_KEY = "nfl_favorite_teams";
const FAVORITES_PLAYERS_KEY = "nfl_favorite_players";

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => 
    loadFromStorage<string[]>(FAVORITES_TEAMS_KEY, [])
  );
  const [favoritePlayers, setFavoritePlayers] = useState<string[]>(() => 
    loadFromStorage<string[]>(FAVORITES_PLAYERS_KEY, [])
  );

  useEffect(() => {
    saveToStorage(FAVORITES_TEAMS_KEY, favoriteTeams);
  }, [favoriteTeams]);

  useEffect(() => {
    saveToStorage(FAVORITES_PLAYERS_KEY, favoritePlayers);
  }, [favoritePlayers]);

  const addFavoriteTeam = useCallback((teamId: string) => {
    setFavoriteTeams((prev) => {
      if (prev.includes(teamId)) return prev;
      return [...prev, teamId];
    });
  }, []);

  const removeFavoriteTeam = useCallback((teamId: string) => {
    setFavoriteTeams((prev) => prev.filter((id) => id !== teamId));
  }, []);

  const toggleFavoriteTeam = useCallback((teamId: string) => {
    setFavoriteTeams((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      }
      return [...prev, teamId];
    });
  }, []);

  const isFavoriteTeam = useCallback((teamId: string) => {
    return favoriteTeams.includes(teamId);
  }, [favoriteTeams]);

  const addFavoritePlayer = useCallback((playerId: string) => {
    setFavoritePlayers((prev) => {
      if (prev.includes(playerId)) return prev;
      return [...prev, playerId];
    });
  }, []);

  const removeFavoritePlayer = useCallback((playerId: string) => {
    setFavoritePlayers((prev) => prev.filter((id) => id !== playerId));
  }, []);

  const toggleFavoritePlayer = useCallback((playerId: string) => {
    setFavoritePlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      return [...prev, playerId];
    });
  }, []);

  const isFavoritePlayer = useCallback((playerId: string) => {
    return favoritePlayers.includes(playerId);
  }, [favoritePlayers]);

  const value: FavoritesContextType = {
    favoriteTeams,
    favoritePlayers,
    addFavoriteTeam,
    removeFavoriteTeam,
    toggleFavoriteTeam,
    isFavoriteTeam,
    addFavoritePlayer,
    removeFavoritePlayer,
    toggleFavoritePlayer,
    isFavoritePlayer,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

export function useFavoriteTeams() {
  const { favoriteTeams, addFavoriteTeam, removeFavoriteTeam, toggleFavoriteTeam, isFavoriteTeam } = useFavorites();
  return { favoriteTeams, addFavoriteTeam, removeFavoriteTeam, toggleFavoriteTeam, isFavoriteTeam };
}

export function useFavoritePlayers() {
  const { favoritePlayers, addFavoritePlayer, removeFavoritePlayer, toggleFavoritePlayer, isFavoritePlayer } = useFavorites();
  return { favoritePlayers, addFavoritePlayer, removeFavoritePlayer, toggleFavoritePlayer, isFavoritePlayer };
}
