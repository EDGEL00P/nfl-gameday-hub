import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameCard } from "@/components/game-card";
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { NFLGame } from "@shared/schema";
import { NFL_TEAMS } from "@/lib/nfl-teams";
import { motion, AnimatePresence } from "framer-motion";

export default function Schedule() {
  const [selectedWeek, setSelectedWeek] = useState(15);
  const [selectedTeam, setSelectedTeam] = useState("all");

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  const { data: games = [], isLoading } = useQuery<NFLGame[]>({
    queryKey: ["/api/schedule", selectedWeek, selectedTeam],
  });

  const groupedByDate = games.reduce((acc, game) => {
    const date = new Date(game.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(game);
    return acc;
  }, {} as Record<string, NFLGame[]>);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            NFL Schedule
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            2024-2025 Regular Season
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek === 1}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-1 min-w-[120px] text-center">
            <span className="text-sm text-muted-foreground">Week</span>
            <p className="font-bold text-lg">{selectedWeek}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedWeek(Math.min(18, selectedWeek + 1))}
            disabled={selectedWeek === 18}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {weeks.map((week) => (
            <Button
              key={week}
              variant={selectedWeek === week ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedWeek(week)}
              className="shrink-0"
              data-testid={`button-week-${week}`}
            >
              {week}
            </Button>
          ))}
        </div>
      </div>

      {/* Team Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[200px]" data-testid="select-team-filter">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {NFL_TEAMS.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <div className="flex items-center gap-2">
                  <img src={team.logo} alt={team.name} className="w-4 h-4" />
                  {team.displayName}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Games by Date */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="h-48 animate-pulse bg-muted" />
                <Card className="h-48 animate-pulse bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-8">
          <AnimatePresence>
            {Object.entries(groupedByDate).map(([date, dateGames], index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {date}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {dateGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No games scheduled for Week {selectedWeek}</p>
          <p className="text-sm mt-1">Try selecting a different week</p>
        </Card>
      )}
    </div>
  );
}
