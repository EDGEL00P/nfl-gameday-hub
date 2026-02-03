import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Link } from "wouter";
import type { StandingsEntry } from "@shared/schema";
import { motion } from "framer-motion";

interface StandingsTableProps {
  title: string;
  standings: StandingsEntry[];
  compact?: boolean;
}

export function StandingsTable({ title, standings, compact = false }: StandingsTableProps) {
  const getStreakIcon = (streak: string) => {
    if (streak.startsWith("W")) {
      return <ChevronUp className="h-3 w-3 text-green-500" />;
    } else if (streak.startsWith("L")) {
      return <ChevronDown className="h-3 w-3 text-red-500" />;
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getClinchBadge = (clinched?: string) => {
    if (!clinched) return null;
    switch (clinched) {
      case "division":
        return <Badge className="bg-blue-500 text-white text-[10px] ml-1">y</Badge>;
      case "playoff":
        return <Badge className="bg-green-500 text-white text-[10px] ml-1">x</Badge>;
      case "bye":
        return <Badge className="bg-purple-500 text-white text-[10px] ml-1">z</Badge>;
      case "eliminated":
        return <Badge variant="secondary" className="text-[10px] ml-1">e</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card data-testid={`standings-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center w-12">W</TableHead>
                <TableHead className="text-center w-12">L</TableHead>
                {!compact && (
                  <>
                    <TableHead className="text-center w-12">T</TableHead>
                    <TableHead className="text-center w-16">PCT</TableHead>
                    <TableHead className="text-center w-16">PF</TableHead>
                    <TableHead className="text-center w-16">PA</TableHead>
                    <TableHead className="text-center w-16">DIFF</TableHead>
                    <TableHead className="text-center w-16">STRK</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((entry, index) => (
                <motion.tr
                  key={entry.team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    entry.clinched === "division" && "bg-blue-500/5",
                    entry.clinched === "bye" && "bg-purple-500/5",
                    entry.clinched === "eliminated" && "opacity-60"
                  )}
                >
                  <TableCell className="text-center font-mono text-sm">
                    {entry.playoffSeed || entry.rank}
                  </TableCell>
                  <TableCell>
                    <Link href={`/team/${entry.team.id}`}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: entry.team.color + "15" }}
                        >
                          <img
                            src={entry.team.logo}
                            alt={entry.team.name}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <span className="font-medium">{entry.team.shortDisplayName}</span>
                        {getClinchBadge(entry.clinched)}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-green-500">
                    {entry.wins}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-red-500">
                    {entry.losses}
                  </TableCell>
                  {!compact && (
                    <>
                      <TableCell className="text-center text-muted-foreground">
                        {entry.ties}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {entry.winPercentage.toFixed(3).slice(1)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {entry.pointsFor}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {entry.pointsAgainst}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-semibold text-sm",
                          entry.pointDifferential > 0 && "text-green-500",
                          entry.pointDifferential < 0 && "text-red-500"
                        )}>
                          {entry.pointDifferential > 0 && "+"}
                          {entry.pointDifferential}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {getStreakIcon(entry.streak)}
                          <span className="text-sm font-medium">{entry.streak}</span>
                        </div>
                      </TableCell>
                    </>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
