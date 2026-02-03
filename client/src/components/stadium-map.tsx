import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MapPin, Eye, DollarSign, Users } from "lucide-react";
import type { NFLStadium, StadiumSection } from "@shared/schema";
import { motion } from "framer-motion";

interface StadiumMapProps {
  stadium: NFLStadium;
  teamColor: string;
  onSectionSelect?: (section: StadiumSection) => void;
}

export function StadiumMap({ stadium, teamColor, onSectionSelect }: StadiumMapProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("Lower");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Mock sections for visualization
  const mockSections: StadiumSection[] = [
    { id: "100", name: "100", level: "Lower", category: "Premium", priceRange: { min: 250, max: 500 }, viewRating: 5, description: "Lower bowl, near midfield" },
    { id: "101", name: "101", level: "Lower", category: "Premium", priceRange: { min: 200, max: 400 }, viewRating: 4.5, description: "Lower bowl, near 30 yard line" },
    { id: "102", name: "102", level: "Lower", category: "Standard", priceRange: { min: 150, max: 300 }, viewRating: 4, description: "Lower bowl, corner section" },
    { id: "200", name: "200", level: "Club", category: "Premium", priceRange: { min: 350, max: 600 }, viewRating: 5, description: "Club level with premium amenities" },
    { id: "300", name: "300", level: "Upper", category: "Value", priceRange: { min: 75, max: 150 }, viewRating: 3, description: "Upper deck, great views" },
    { id: "301", name: "301", level: "Upper", category: "Value", priceRange: { min: 60, max: 120 }, viewRating: 3, description: "Upper deck, corner section" },
    { id: "400", name: "400", level: "Suite", category: "Premium", priceRange: { min: 500, max: 1500 }, viewRating: 5, description: "Private suite with catering" },
  ];

  const sections = stadium.sections.length > 0 ? stadium.sections : mockSections;
  const filteredSections = sections.filter(s => s.level === selectedLevel || selectedLevel === "All");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "bg-purple-500";
      case "Standard":
        return "bg-blue-500";
      case "Value":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card data-testid="stadium-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{ color: teamColor }} />
          {stadium.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {stadium.city}, {stadium.state} · Capacity: {stadium.capacity.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        {/* Stadium Visualization */}
        <div className="relative aspect-[16/10] bg-gradient-to-b from-muted/50 to-muted rounded-lg mb-6 overflow-hidden">
          {/* Field */}
          <div className="absolute inset-x-[20%] inset-y-[25%] bg-green-700 rounded-lg border-2 border-white/50">
            <div className="absolute inset-4 border border-white/30 rounded-sm" />
            {/* End zones */}
            <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-r from-green-800 to-green-700 rounded-l-lg" />
            <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-gradient-to-l from-green-800 to-green-700 rounded-r-lg" />
          </div>

          {/* Lower Bowl Sections */}
          <div className="absolute left-[10%] right-[10%] top-[10%] h-[15%] flex gap-0.5 justify-center">
            {[100, 101, 102, 103, 104].map((sec, i) => (
              <motion.button
                key={sec}
                className={cn(
                  "flex-1 rounded-t-sm transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold text-white",
                  hoveredSection === String(sec) ? "ring-2 ring-white scale-105 z-10" : ""
                )}
                style={{ backgroundColor: teamColor + (hoveredSection === String(sec) ? "ff" : "aa") }}
                onMouseEnter={() => setHoveredSection(String(sec))}
                onMouseLeave={() => setHoveredSection(null)}
                whileHover={{ scale: 1.05 }}
              >
                {sec}
              </motion.button>
            ))}
          </div>

          {/* Lower Bowl Sections - Bottom */}
          <div className="absolute left-[10%] right-[10%] bottom-[10%] h-[15%] flex gap-0.5 justify-center">
            {[110, 111, 112, 113, 114].map((sec, i) => (
              <motion.button
                key={sec}
                className={cn(
                  "flex-1 rounded-b-sm transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold text-white",
                  hoveredSection === String(sec) ? "ring-2 ring-white scale-105 z-10" : ""
                )}
                style={{ backgroundColor: teamColor + (hoveredSection === String(sec) ? "ff" : "aa") }}
                onMouseEnter={() => setHoveredSection(String(sec))}
                onMouseLeave={() => setHoveredSection(null)}
                whileHover={{ scale: 1.05 }}
              >
                {sec}
              </motion.button>
            ))}
          </div>

          {/* Left Sections */}
          <div className="absolute left-0 top-[15%] bottom-[15%] w-[10%] flex flex-col gap-0.5 justify-center px-0.5">
            {[120, 121, 122].map((sec) => (
              <motion.button
                key={sec}
                className={cn(
                  "flex-1 rounded-l-sm transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold text-white",
                  hoveredSection === String(sec) ? "ring-2 ring-white scale-105 z-10" : ""
                )}
                style={{ backgroundColor: teamColor + (hoveredSection === String(sec) ? "ff" : "88") }}
                onMouseEnter={() => setHoveredSection(String(sec))}
                onMouseLeave={() => setHoveredSection(null)}
                whileHover={{ scale: 1.05 }}
              >
                {sec}
              </motion.button>
            ))}
          </div>

          {/* Right Sections */}
          <div className="absolute right-0 top-[15%] bottom-[15%] w-[10%] flex flex-col gap-0.5 justify-center px-0.5">
            {[130, 131, 132].map((sec) => (
              <motion.button
                key={sec}
                className={cn(
                  "flex-1 rounded-r-sm transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold text-white",
                  hoveredSection === String(sec) ? "ring-2 ring-white scale-105 z-10" : ""
                )}
                style={{ backgroundColor: teamColor + (hoveredSection === String(sec) ? "ff" : "88") }}
                onMouseEnter={() => setHoveredSection(String(sec))}
                onMouseLeave={() => setHoveredSection(null)}
                whileHover={{ scale: 1.05 }}
              >
                {sec}
              </motion.button>
            ))}
          </div>

          {/* Hovered Section Info */}
          {hoveredSection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border"
            >
              <p className="font-bold">Section {hoveredSection}</p>
              <p className="text-sm text-muted-foreground">Click to view tickets</p>
            </motion.div>
          )}
        </div>

        {/* Level Tabs */}
        <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="Lower">Lower</TabsTrigger>
            <TabsTrigger value="Club">Club</TabsTrigger>
            <TabsTrigger value="Upper">Upper</TabsTrigger>
            <TabsTrigger value="Suite">Suites</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className="mt-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredSections.map((section) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
                  onClick={() => onSectionSelect?.(section)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Section {section.name}</span>
                    <div className={cn("w-2 h-2 rounded-full", getCategoryColor(section.category))} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{section.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {section.viewRating}/5
                    </span>
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="h-3 w-3" />
                      ${section.priceRange.min}-${section.priceRange.max}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Price Categories</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs">Premium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs">Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Value</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
