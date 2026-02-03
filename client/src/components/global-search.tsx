import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Calendar,
  User,
  Clock,
  X,
  Mic,
  MicOff,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { NFL_TEAMS } from "@/lib/nfl-teams";
import { cn } from "@/lib/utils";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const RECENT_SEARCHES_KEY = "nfl_recent_searches";
const MAX_RECENT_SEARCHES = 10;

interface SearchResult {
  id: string;
  type: "team" | "player" | "game";
  title: string;
  subtitle: string;
  icon?: string;
  color?: string;
  url: string;
}

interface MockPlayer {
  id: string;
  name: string;
  position: string;
  teamId: string;
  teamName: string;
}

const MOCK_PLAYERS: MockPlayer[] = [
  { id: "p1", name: "Patrick Mahomes", position: "QB", teamId: "kc", teamName: "Chiefs" },
  { id: "p2", name: "Josh Allen", position: "QB", teamId: "buf", teamName: "Bills" },
  { id: "p3", name: "Jalen Hurts", position: "QB", teamId: "phi", teamName: "Eagles" },
  { id: "p4", name: "Lamar Jackson", position: "QB", teamId: "bal", teamName: "Ravens" },
  { id: "p5", name: "Joe Burrow", position: "QB", teamId: "cin", teamName: "Bengals" },
  { id: "p6", name: "Travis Kelce", position: "TE", teamId: "kc", teamName: "Chiefs" },
  { id: "p7", name: "Tyreek Hill", position: "WR", teamId: "mia", teamName: "Dolphins" },
  { id: "p8", name: "Justin Jefferson", position: "WR", teamId: "min", teamName: "Vikings" },
  { id: "p9", name: "Davante Adams", position: "WR", teamId: "lv", teamName: "Raiders" },
  { id: "p10", name: "Derrick Henry", position: "RB", teamId: "bal", teamName: "Ravens" },
  { id: "p11", name: "Christian McCaffrey", position: "RB", teamId: "sf", teamName: "49ers" },
  { id: "p12", name: "Ja'Marr Chase", position: "WR", teamId: "cin", teamName: "Bengals" },
  { id: "p13", name: "Micah Parsons", position: "LB", teamId: "dal", teamName: "Cowboys" },
  { id: "p14", name: "T.J. Watt", position: "LB", teamId: "pit", teamName: "Steelers" },
  { id: "p15", name: "Aaron Donald", position: "DT", teamId: "lar", teamName: "Rams" },
  { id: "p16", name: "Nick Bosa", position: "DE", teamId: "sf", teamName: "49ers" },
  { id: "p17", name: "Sauce Gardner", position: "CB", teamId: "nyj", teamName: "Jets" },
  { id: "p18", name: "CeeDee Lamb", position: "WR", teamId: "dal", teamName: "Cowboys" },
  { id: "p19", name: "A.J. Brown", position: "WR", teamId: "phi", teamName: "Eagles" },
  { id: "p20", name: "Stefon Diggs", position: "WR", teamId: "hou", teamName: "Texans" },
];

const TRENDING_SEARCHES = [
  "Kansas City Chiefs",
  "Patrick Mahomes",
  "Super Bowl",
  "NFL Playoffs",
  "Trade rumors",
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  return { recentSearches, addSearch, removeSearch, clearAll };
}

function useVoiceSearch(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionClass() as SpeechRecognitionInterface;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange }: GlobalSearchProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();
  
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const debouncedQuery = useDebounce(query, 150);

  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useVoiceSearch(handleVoiceResult);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const searchResults = useCallback((): SearchResult[] => {
    if (!debouncedQuery.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = debouncedQuery.toLowerCase();

    NFL_TEAMS.forEach((team) => {
      const matchScore = getMatchScore(
        [team.displayName, team.name, team.abbreviation, team.location],
        lowerQuery
      );
      if (matchScore > 0) {
        results.push({
          id: team.id,
          type: "team",
          title: team.displayName,
          subtitle: `${team.conference} ${team.division}`,
          icon: team.logo,
          color: team.color,
          url: `/team/${team.id}`,
        });
      }
    });

    MOCK_PLAYERS.forEach((player) => {
      const matchScore = getMatchScore([player.name, player.position], lowerQuery);
      if (matchScore > 0) {
        const team = NFL_TEAMS.find((t) => t.id === player.teamId);
        results.push({
          id: player.id,
          type: "player",
          title: player.name,
          subtitle: `${player.position} - ${player.teamName}`,
          icon: team?.logo,
          color: team?.color,
          url: `/player/${player.id}`,
        });
      }
    });

    return results.slice(0, 15);
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    addSearch(query);
    setOpen(false);
    setQuery("");
    navigate(result.url);
  };

  const handleRecentSelect = (search: string) => {
    setQuery(search);
  };

  const handleSearchPage = () => {
    if (query.trim()) {
      addSearch(query);
    }
    setOpen(false);
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setQuery("");
  };

  const results = searchResults();
  const teamResults = results.filter((r) => r.type === "team");
  const playerResults = results.filter((r) => r.type === "player");
  const hasResults = results.length > 0;
  const showRecent = !debouncedQuery.trim() && recentSearches.length > 0;
  const showTrending = !debouncedQuery.trim() && recentSearches.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          placeholder="Search teams, players, games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="input-global-search"
        />
        {isSupported && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0",
              isListening && "text-red-500"
            )}
            onClick={isListening ? stopListening : startListening}
            data-testid="button-voice-search"
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Mic className="h-4 w-4 text-red-500" />
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <Mic className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}
        {!isSupported && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-50" disabled>
            <MicOff className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CommandList className="max-h-[400px]">
        {debouncedQuery.trim() && !hasResults && (
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No results found for "{debouncedQuery}"</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary underline-offset-4 hover:underline"
                onClick={handleSearchPage}
                data-testid="link-view-all-results"
              >
                View all on search page
              </Button>
            </div>
          </CommandEmpty>
        )}

        {showTrending && (
          <CommandGroup heading="Trending">
            {TRENDING_SEARCHES.map((search) => (
              <CommandItem
                key={search}
                value={search}
                onSelect={() => setQuery(search)}
                className="hover-elevate cursor-pointer"
                data-testid={`trending-item-${search.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <TrendingUp className="mr-2 h-4 w-4 text-orange-500" />
                <span>{search}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {showRecent && (
          <CommandGroup heading="Recent Searches">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs text-muted-foreground">Recent searches</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                data-testid="button-clear-all-recent"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
            {recentSearches.map((search) => (
              <CommandItem
                key={search}
                value={search}
                onSelect={() => handleRecentSelect(search)}
                className="group hover-elevate cursor-pointer"
                data-testid={`recent-item-${search.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{search}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(search);
                  }}
                  data-testid={`button-remove-recent-${search.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {teamResults.length > 0 && (
          <CommandGroup heading="Teams">
            {teamResults.map((result) => (
              <CommandItem
                key={result.id}
                value={result.title}
                onSelect={() => handleSelect(result)}
                className="hover-elevate cursor-pointer"
                data-testid={`search-result-team-${result.id}`}
              >
                <div
                  className="mr-2 h-8 w-8 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: result.color + "20" }}
                >
                  {result.icon ? (
                    <img src={result.icon} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Team
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {playerResults.length > 0 && (
          <>
            {teamResults.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Players">
              {playerResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result)}
                  className="hover-elevate cursor-pointer"
                  data-testid={`search-result-player-${result.id}`}
                >
                  <div
                    className="mr-2 h-8 w-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: result.color + "20" }}
                  >
                    {result.icon ? (
                      <img src={result.icon} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Player
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {hasResults && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={handleSearchPage}
                className="justify-center text-center hover-elevate cursor-pointer"
                data-testid="button-view-all-search"
              >
                <Search className="mr-2 h-4 w-4" />
                View all results
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">↑↓</span>
          </kbd>
          <span>Navigate</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">↵</span>
          </kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">esc</span>
          </kbd>
          <span>Close</span>
        </div>
      </div>
    </CommandDialog>
  );
}

function getMatchScore(texts: string[], query: string): number {
  let maxScore = 0;
  for (const text of texts) {
    const lower = text.toLowerCase();
    if (lower === query) {
      maxScore = Math.max(maxScore, 3);
    } else if (lower.startsWith(query)) {
      maxScore = Math.max(maxScore, 2);
    } else if (lower.includes(query)) {
      maxScore = Math.max(maxScore, 1);
    }
  }
  return maxScore;
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
        data-testid="button-open-search"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
}
