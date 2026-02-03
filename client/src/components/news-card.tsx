import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import type { NFLNews } from "@shared/schema";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  news: NFLNews;
  featured?: boolean;
}

export const NewsCard = memo(function NewsCard({ news, featured = false }: NewsCardProps) {
  const getSentimentIcon = () => {
    switch (news.sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(news.published), { addSuffix: true });

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className="overflow-hidden hover-elevate group cursor-pointer"
          data-testid={`news-card-${news.id}`}
        >
          <div className="relative">
            {news.imageUrl ? (
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={news.imageUrl}
                  alt={news.headline}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {news.categories.slice(0, 2).map((cat, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/20 text-white text-[10px]">
                        {cat}
                      </Badge>
                    ))}
                    {news.premium && (
                      <Badge className="bg-amber-500 text-white text-[10px]">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-2">
                    {news.headline}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-3">
                    {news.description}
                  </p>
                  <div className="flex items-center gap-3 text-white/60 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo}
                    </span>
                    <span>{news.source}</span>
                    {news.author && <span>by {news.author}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {news.categories.slice(0, 2).map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-xl font-bold leading-tight mb-2">
                  {news.headline}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                  {news.description}
                </p>
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </span>
                  <span>{news.source}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className="overflow-hidden hover-elevate cursor-pointer group"
        data-testid={`news-card-${news.id}`}
      >
        <div className="flex gap-4 p-4">
          {news.imageUrl && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={news.imageUrl}
                alt={news.headline}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {news.categories[0] && (
                <Badge variant="secondary" className="text-[10px]">
                  {news.categories[0]}
                </Badge>
              )}
              {getSentimentIcon()}
            </div>
            <h4 className={cn(
              "font-semibold leading-snug mb-1 group-hover:text-primary transition-colors",
              news.imageUrl ? "line-clamp-2" : "line-clamp-2"
            )}>
              {news.headline}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {news.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
              <span className="mx-1">·</span>
              <span>{news.source}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
