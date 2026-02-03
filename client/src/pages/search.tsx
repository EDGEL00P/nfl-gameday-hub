import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  User,
  Calendar,
  Clock,
  X,
  Mic,
  MicOff,
  Trash2,
  TrendingUp,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
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

type SearchCategory = "all" | "teams" | "players" | "games";

interface SearchResult {
  id: string;
  type: "team" | "player" | "game";
  title: string;
  subtitle: string;
  description?: string;
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
  jersey?: string;
}

const MOCK_PLAYERS: MockPlayer[] = [
  { id: "p1", name: "Patrick Mahomes", position: "QB", teamId: "kc", teamName: "Chiefs", jersey: "15" },
  { id: "p2", name: "Josh Allen", position: "QB", teamId: "buf", teamName: "Bills", jersey: "17" },
  { id: "p3", name: "Jalen Hurts", position: "QB", teamId: "phi", teamName: "Eagles", jersey: "1" },
  { id: "p4", name: "Lamar Jackson", position: "QB", teamId: "bal", teamName: "Ravens", jersey: "8" },
  { id: "p5", name: "Joe Burrow", position: "QB", teamId: "cin", teamName: "Bengals", jersey: "9" },
  { id: "p6", name: "Travis Kelce", position: "TE", teamId: "kc", teamName: "Chiefs", jersey: "87" },
  { id: "p7", name: "Tyreek Hill", position: "WR", teamId: "mia", teamName: "Dolphins", jersey: "10" },
  { id: "p8", name: "Justin Jefferson", position: "WR", teamId: "min", teamName: "Vikings", jersey: "18" },
  { id: "p9", name: "Davante Adams", position: "WR", teamId: "lv", teamName: "Raiders", jersey: "17" },
  { id: "p10", name: "Derrick Henry", position: "RB", teamId: "bal", teamName: "Ravens", jersey: "22" },
  { id: "p11", name: "Christian McCaffrey", position: "RB", teamId: "sf", teamName: "49ers", jersey: "23" },
  { id: "p12", name: "Ja'Marr Chase", position: "WR", teamId: "cin", teamName: "Bengals", jersey: "1" },
  { id: "p13", name: "Micah Parsons", position: "LB", teamId: "dal", teamName: "Cowboys", jersey: "11" },
  { id: "p14", name: "T.J. Watt", position: "LB", teamId: "pit", teamName: "Steelers", jersey: "90" },
  { id: "p15", name: "Aaron Donald", position: "DT", teamId: "lar", teamName: "Rams", jersey: "99" },
  { id: "p16", name: "Nick Bosa", position: "DE", teamId: "sf", teamName: "49ers", jersey: "97" },
  { id: "p17", name: "Sauce Gardner", position: "CB", teamId: "nyj", teamName: "Jets", jersey: "1" },
  { id: "p18", name: "CeeDee Lamb", position: "WR", teamId: "dal", teamName: "Cowboys", jersey: "88" },
  { id: "p19", name: "A.J. Brown", position: "WR", teamId: "phi", teamName: "Eagles", jersey: "11" },
  { id: "p20", name: "Stefon Diggs", position: "WR", teamId: "hou", teamName: "Texans", jersey: "1" },
];

const TRENDING_SEARCHES = [
  "Kansas City Chiefs",
  "Patrick Mahomes",
  "Super Bowl",
  "NFL Playoffs",
  "Trade rumors",
];

const POPULAR_TEAMS = ["kc", "phi", "sf", "buf", "dal", "mia"];
const POPULAR_PLAYERS = ["p1", "p3", "p11", "p6", "p8", "p7"];

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

export default function SearchPage() {
  const searchParams = useSearch();
  const urlQuery = new URLSearchParams(searchParams).get("q") || "";
  
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState<SearchCategory>("all");
  const [, navigate] = useLocation();
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
    addSearch(text);
  }, [addSearch]);

  const { isListening, isSupported, startListening, stopListening } = useVoiceSearch(handleVoiceResult);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  const searchResults = useCallback((): SearchResult[] => {
    if (!debouncedQuery.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = debouncedQuery.toLowerCase();

    if (category === "all" || category === "teams") {
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
            description: team.stadium.name,
            icon: team.logo,
            color: team.color,
            url: `/team/${team.id}`,
          });
        }
      });
    }

    if (category === "all" || category === "players") {
      MOCK_PLAYERS.forEach((player) => {
        const matchScore = getMatchScore([player.name, player.position, player.teamName], lowerQuery);
        if (matchScore > 0) {
          const team = NFL_TEAMS.find((t) => t.id === player.teamId);
          results.push({
            id: player.id,
            type: "player",
            title: player.name,
            subtitle: `${player.position} - ${player.teamName}`,
            description: player.jersey ? `#${player.jersey}` : undefined,
            icon: team?.logo,
            color: team?.color,
            url: `/player/${player.id}`,
          });
        }
      });
    }

    return results;
  }, [debouncedQuery, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addSearch(query);
    }
  };

  const handleQuickSearch = (search: string) => {
    setQuery(search);
    addSearch(search);
  };

  const results = searchResults();
  const teamResults = results.filter((r) => r.type === "team");
  const playerResults = results.filter((r) => r.type === "player");
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = results.length > 0;

  const popularTeams = NFL_TEAMS.filter((t) => POPULAR_TEAMS.includes(t.id));
  const popularPlayers = MOCK_PLAYERS.filter((p) => POPULAR_PLAYERS.includes(p.id));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Search
        </h1>
        <p className="text-muted-foreground text-sm">
          Find teams, players, and games across the NFL
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search teams, players, games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-24 h-12 text-base"
            data-testid="input-search-page"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuery("")}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isListening && "text-red-500")}
                onClick={isListening ? stopListening : startListening}
                data-testid="button-voice-search-page"
              >
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="listening"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="h-4 w-4 text-red-500" />
                    </motion.div>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
        </div>

        <Tabs value={category} onValueChange={(v) => setCategory(v as SearchCategory)}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              <Filter className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">
              <Users className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="players" data-testid="tab-players">
              <User className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="games" data-testid="tab-games">
              <Calendar className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </form>

      {isListening && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <Mic className="h-5 w-5 text-red-500" />
            </motion.div>
            <div>
              <p className="font-medium">Listening...</p>
              <p className="text-sm text-muted-foreground">Speak now to search</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={stopListening}
              data-testid="button-stop-listening"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {!hasQuery && recentSearches.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              data-testid="button-clear-all-recent-page"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <Badge
                key={search}
                variant="secondary"
                className="cursor-pointer hover-elevate group pr-1"
                onClick={() => handleQuickSearch(search)}
                data-testid={`recent-search-${search.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span>{search}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(search);
                  }}
                  data-testid={`remove-recent-${search.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {!hasQuery && (
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((search) => (
                <Badge
                  key={search}
                  variant="outline"
                  className="cursor-pointer hover-elevate"
                  onClick={() => handleQuickSearch(search)}
                  data-testid={`trending-search-${search.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                Popular Teams
              </h2>
              <div className="space-y-2">
                {popularTeams.map((team) => (
                  <Link key={team.id} href={`/team/${team.id}`}>
                    <div
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      data-testid={`popular-team-${team.id}`}
                    >
                      <div
                        className="h-10 w-10 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: team.color + "20" }}
                      >
                        <img src={team.logo} alt="" className="h-6 w-6 object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{team.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.conference} {team.division}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-primary" />
                Popular Players
              </h2>
              <div className="space-y-2">
                {popularPlayers.map((player) => {
                  const team = NFL_TEAMS.find((t) => t.id === player.teamId);
                  return (
                    <Link key={player.id} href={`/player/${player.id}`}>
                      <div
                        className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                        data-testid={`popular-player-${player.id}`}
                      >
                        <div
                          className="h-10 w-10 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: (team?.color || "#888") + "20" }}
                        >
                          {team?.logo ? (
                            <img src={team.logo} alt="" className="h-6 w-6 object-contain" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {player.position} - {player.teamName}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {hasQuery && !hasResults && (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find anything matching "{debouncedQuery}"
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <p className="text-sm text-muted-foreground w-full mb-2">Try searching for:</p>
            {TRENDING_SEARCHES.slice(0, 3).map((search) => (
              <Badge
                key={search}
                variant="outline"
                className="cursor-pointer hover-elevate"
                onClick={() => handleQuickSearch(search)}
                data-testid={`suggestion-${search.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {search}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {hasQuery && hasResults && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQuery}"
          </p>

          {teamResults.length > 0 && (category === "all" || category === "teams") && (
            <div className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams ({teamResults.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {teamResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={result.url}>
                        <Card
                          className="p-4 hover-elevate cursor-pointer"
                          data-testid={`result-team-${result.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: result.color + "20" }}
                            >
                              {result.icon ? (
                                <img src={result.icon} alt="" className="h-8 w-8 object-contain" />
                              ) : (
                                <Users className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{result.title}</p>
                              <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                              {result.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">Team</Badge>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {playerResults.length > 0 && (category === "all" || category === "players") && (
            <div className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Players ({playerResults.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {playerResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={result.url}>
                        <Card
                          className="p-4 hover-elevate cursor-pointer"
                          data-testid={`result-player-${result.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: (result.color || "#888") + "20" }}
                            >
                              {result.icon ? (
                                <img src={result.icon} alt="" className="h-8 w-8 object-contain" />
                              ) : (
                                <User className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{result.title}</p>
                              <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                              {result.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary">Player</Badge>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {category === "games" && (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Game search coming soon</h3>
              <p className="text-muted-foreground">
                Search for games by team matchups, dates, or venues
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
