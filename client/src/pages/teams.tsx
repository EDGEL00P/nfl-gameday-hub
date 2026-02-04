import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Users, Search, Grid3X3, List } from "lucide-react";
import { Link } from "wouter";
import { NFL_TEAMS, getAllDivisions } from "@/lib/nfl-teams";
import { motion, AnimatePresence } from "framer-motion";

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedConference, setSelectedConference] = useState<"all" | "AFC" | "NFC">("all");

  const divisions = getAllDivisions();
  
  const filteredTeams = NFL_TEAMS.filter(team => {
    const matchesSearch = team.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConference = selectedConference === "all" || team.conference === selectedConference;
    return matchesSearch && matchesConference;
  });

  const groupedByDivision = divisions.map(div => ({
    ...div,
    teams: div.teams.filter(team => 
      filteredTeams.some(ft => ft.id === team.id)
    ),
  })).filter(div => div.teams.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            NFL Teams
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All 32 NFL teams across 8 divisions
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-teams"
            />
          </div>
          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-r-none", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-l-none", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conference Filter */}
      <Tabs value={selectedConference} onValueChange={(v) => setSelectedConference(v as typeof selectedConference)}>
        <TabsList>
          <TabsTrigger value="all">All Teams</TabsTrigger>
          <TabsTrigger value="AFC">AFC</TabsTrigger>
          <TabsTrigger value="NFC">NFC</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Teams Display */}
      {viewMode === "grid" ? (
        <div className="space-y-8">
          {groupedByDivision.map((div) => (
            <div key={`${div.conference}-${div.division}`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  div.conference === "AFC" ? "bg-red-500" : "bg-blue-500"
                )} />
                {div.conference} {div.division}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {div.teams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/team/${team.id}`}>
                        <Card
                          className="group overflow-hidden hover-elevate cursor-pointer"
                          data-testid={`team-card-${team.id}`}
                        >
                          <div
                            className="h-2 transition-all group-hover:h-3"
                            style={{ backgroundColor: team.color }}
                          />
                          <div className="p-4 text-center">
                            <div
                              className="w-20 h-20 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: team.color + "15" }}
                            >
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-14 h-14 object-contain"
                                loading="lazy"
                              />
                            </div>
                            <p className="font-bold">{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.location}</p>
                            {team.record && (
                              <p className="text-xs mt-1 font-mono">
                                {team.record.wins}-{team.record.losses}
                                {team.record.ties > 0 && `-${team.record.ties}`}
                              </p>
                            )}
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link href={`/team/${team.id}`}>
                  <Card
                    className="p-3 hover-elevate cursor-pointer"
                    data-testid={`team-row-${team.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: team.color + "15" }}
                      >
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-8 h-8 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{team.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.conference} {team.division} · {team.stadium.name}
                        </p>
                      </div>
                      <div className="text-right">
                        {team.record && (
                          <p className="font-mono font-medium">
                            {team.record.wins}-{team.record.losses}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{team.abbreviation}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredTeams.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No teams found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </Card>
      )}
    </div>
  );
}
