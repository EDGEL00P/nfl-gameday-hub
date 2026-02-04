import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandSeparator
} from "@/components/ui/command";
import { Search, User, Shield, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NFLPlayer, NFLTeam } from "@shared/schema";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useLocation();

  // Toggle with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch players based on query
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<NFLPlayer[]>({
    queryKey: ["/api/players", { search: query }],
    enabled: query.length > 2
  });

  // Fetch teams (client filtered)
  const { data: allTeams = [] } = useQuery<NFLTeam[]>({ queryKey: ["/api/teams"] });
  const teams = query ? allTeams.filter(t => 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.displayName.toLowerCase().includes(query.toLowerCase()) ||
    t.abbreviation.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) : [];

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    setLocation(url);
  }, [setLocation]);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search players, teams...</span>
        <span className="sr-only">Search players, teams...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search players, teams (e.g. Mahomes, Bills)..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {query.length > 0 && query.length < 3 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 3 characters to search...
            </div>
          )}

          {teams.length > 0 && (
            <CommandGroup heading="Teams">
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={`team-${team.id}-${team.name}`}
                  onSelect={() => handleSelect(`/team/${team.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                  <span>{team.displayName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          <CommandSeparator />

          {players.length > 0 && (
            <CommandGroup heading="Players">
              {players.slice(0, 5).map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.displayName}`}
                  onSelect={() => handleSelect(`/player/${player.id}`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{player.displayName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      #{player.jersey} • {player.position} • {player.team.toUpperCase()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          
          <CommandGroup heading="Navigation">
            <CommandItem value="schedule" onSelect={() => handleSelect("/schedule")}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </CommandItem>
            <CommandItem value="standings" onSelect={() => handleSelect("/standings")}>
              <Shield className="mr-2 h-4 w-4" />
              Standings
            </CommandItem>
            <CommandItem value="tickets" onSelect={() => handleSelect("/tickets")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Tickets
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
