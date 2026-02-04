import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsCard } from "@/components/news-card";
import { cn } from "@/lib/utils";
import { Newspaper, Search, TrendingUp, Star, Clock, Filter, Loader2 } from "lucide-react";
import type { NFLNews } from "@shared/schema";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: news = [], isLoading } = useQuery<NFLNews[]>({
    queryKey: ["/api/news"],
  });

  const categories = ["all", "Game Recap", "Injuries", "Trade Rumors", "Playoffs", "Analysis", "Rookies"];

  const filteredNews = news.filter(item => {
    const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews[0];
  const regularNews = filteredNews.slice(1);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            NFL News
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Latest news, analysis, and updates from around the league
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-news"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {category === "all" ? "All News" : category}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Article */}
          {featuredNews && (
            <div className="md:col-span-2">
              <NewsCard news={featuredNews} featured />
            </div>
          )}

          {/* Regular Articles Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {regularNews.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NewsCard news={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredNews.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No news found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
