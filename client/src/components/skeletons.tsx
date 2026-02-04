import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const GameCardSkeleton = memo(function GameCardSkeleton() {
  return (
    <Card className="p-4" data-testid="skeleton-game-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="flex items-center gap-3 p-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
});

export const TeamCardSkeleton = memo(function TeamCardSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="skeleton-team-card">
      <Skeleton className="h-16 w-full" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    </Card>
  );
});

export const PlayerCardSkeleton = memo(function PlayerCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card className="p-3" data-testid="skeleton-player-card-compact">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="skeleton-player-card">
      <Skeleton className="h-16 w-full" />
      <div className="pt-8 p-4">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="w-20 h-20 rounded-xl -mt-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="pt-3 border-t border-border">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center space-y-1">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export const NewsSkeleton = memo(function NewsSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <Card className="overflow-hidden" data-testid="skeleton-news-featured">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid="skeleton-news">
      <div className="flex gap-4 p-4">
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
});

export const StatsSkeleton = memo(function StatsSkeleton() {
  return (
    <Card className="p-4" data-testid="skeleton-stats">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </Card>
  );
});

export const StandingsTableSkeleton = memo(function StandingsTableSkeleton() {
  return (
    <Card className="p-4" data-testid="skeleton-standings">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </Card>
  );
});

export const ScheduleItemSkeleton = memo(function ScheduleItemSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border" data-testid="skeleton-schedule-item">
      <Skeleton className="w-16 h-10" />
      <div className="flex items-center gap-2 flex-1">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
});

export const GameCenterSkeleton = memo(function GameCenterSkeleton() {
  return (
    <div className="space-y-6 p-6" data-testid="skeleton-game-center">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
          <div className="flex items-center gap-4">
            <div className="space-y-2 text-right">
              <Skeleton className="h-6 w-32 ml-auto" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="w-16 h-16 rounded-lg" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatsSkeleton />
        </div>
        <div>
          <StatsSkeleton />
        </div>
      </div>
    </div>
  );
});
