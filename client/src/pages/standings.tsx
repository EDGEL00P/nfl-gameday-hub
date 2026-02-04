import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsTable } from "@/components/standings-table";
import { Trophy, Users, Loader2 } from "lucide-react";
import type { StandingsEntry } from "@shared/schema";
import { getAllDivisions } from "@/lib/nfl-teams";

export default function Standings() {
  const { data: standingsData = {}, isLoading } = useQuery<{ [key: string]: StandingsEntry[] }>({
    queryKey: ["/api/standings"],
  });


  const divisions = getAllDivisions();
  const afcDivisions = divisions.filter(d => d.conference === "AFC");
  const nfcDivisions = divisions.filter(d => d.conference === "NFC");

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          NFL Standings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          2024-2025 Regular Season
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold">y</span>
          <span className="text-muted-foreground">Clinched Division</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold">x</span>
          <span className="text-muted-foreground">Clinched Playoff</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-purple-500 text-white text-[10px] font-bold">z</span>
          <span className="text-muted-foreground">Clinched Bye</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold">e</span>
          <span className="text-muted-foreground">Eliminated</span>
        </div>
      </div>

      {/* Conference Tabs */}
      <Tabs defaultValue="afc" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="afc" className="gap-1">
            <Users className="h-3 w-3" />
            AFC
          </TabsTrigger>
          <TabsTrigger value="nfc" className="gap-1">
            <Users className="h-3 w-3" />
            NFC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="afc" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {afcDivisions.map((div) => {
              const divisionKey = `${div.conference} ${div.division}`;
              const divStandings = standingsData[divisionKey] || [];
              return (
                <StandingsTable
                  key={divisionKey}
                  title={`AFC ${div.division}`}
                  standings={divStandings}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="nfc" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {nfcDivisions.map((div) => {
              const divisionKey = `${div.conference} ${div.division}`;
              const divStandings = standingsData[divisionKey] || [];
              return (
                <StandingsTable
                  key={divisionKey}
                  title={`NFC ${div.division}`}
                  standings={divStandings}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
