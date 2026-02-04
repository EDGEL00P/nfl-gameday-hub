import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { NFLTeam } from "@shared/schema";

interface TeamCardProps {
  team: NFLTeam;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/team/${team.id}`}>
      <Card className="hover-elevate cursor-pointer h-full border-l-4" style={{ borderLeftColor: team.color }}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full p-2">
              <img src={team.logo} alt={team.abbreviation} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">{team.displayName}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] h-5">
                  {team.conference}-{team.division}
                </Badge>
                {team.record && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {team.record.wins}-{team.record.losses}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
