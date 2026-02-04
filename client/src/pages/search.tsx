import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, ArrowRight, User, Shield, Users } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { TeamCard } from "@/components/team-card";
import type { NFLPlayer, NFLTeam } from "@shared/schema";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");

  // Update URL when query changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }, [query]);

  // Fetch players
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<NFLPlayer[]>({
    queryKey: ["/api/players", { search: query }],
    enabled: query.length > 2
  });

  // Fetch teams (client-side filter for now as we don't have search endpoint for teams yet)
  const { data: allTeams = [] } = useQuery<NFLTeam[]>({ queryKey: ["/api/teams"] });
  const teams = allTeams.filter(t => 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.displayName.toLowerCase().includes(query.toLowerCase()) ||
    t.abbreviation.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = players.length > 0 || teams.length > 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="relative w-full max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players, teams..."
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Results ({players.length + teams.length})</TabsTrigger>
          <TabsTrigger value="players">Players ({players.length})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {!query && (
             <div className="text-center py-12 text-muted-foreground">
               <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p className="text-lg">Start typing to search for players and teams</p>
             </div>
          )}

          {query && !hasResults && !isLoadingPlayers && (
             <div className="text-center py-12 text-muted-foreground">
               <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p className="text-lg">No results found for "{query}"</p>
             </div>
          )}

          {/* All Results Tab */}
          <TabsContent value="all" className="space-y-8">
            {teams.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Teams
                  </h2>
                  {teams.length > 3 && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("teams")}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.slice(0, 3).map(team => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </section>
            )}

            {players.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" /> Players
                  </h2>
                  {players.length > 6 && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("players")}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.slice(0, 6).map(player => {
                    const playerTeam = allTeams.find(t => t.id === player.team.toLowerCase());
                    return (
                      <PlayerCard 
                        key={player.id} 
                        player={player} 
                        teamColor={playerTeam?.color || "#000"} 
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(player => {
                const playerTeam = allTeams.find(t => t.id === player.team.toLowerCase());
                return (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    teamColor={playerTeam?.color || "#000"} 
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
