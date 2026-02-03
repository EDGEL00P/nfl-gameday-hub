import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger, GlobalSearch } from "@/components/global-search";
import { SkipLinks } from "@/components/skip-link";
import { OfflineBanner } from "@/components/offline-banner";
import { GlobalLoadingIndicator, PageLoader } from "@/components/loading-indicator";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/home"));
const Scoreboard = lazy(() => import("@/pages/scoreboard"));
const GameCenter = lazy(() => import("@/pages/game-center"));
const Standings = lazy(() => import("@/pages/standings"));
const Teams = lazy(() => import("@/pages/teams"));
const TeamDetail = lazy(() => import("@/pages/team-detail"));
const PlayerProfile = lazy(() => import("@/pages/player-profile"));
const Schedule = lazy(() => import("@/pages/schedule"));
const News = lazy(() => import("@/pages/news"));
const Tickets = lazy(() => import("@/pages/tickets"));
const SearchPage = lazy(() => import("@/pages/search"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scoreboard" component={Scoreboard} />
      <Route path="/game/:id" component={GameCenter} />
      <Route path="/standings" component={Standings} />
      <Route path="/teams" component={Teams} />
      <Route path="/team/:id" component={TeamDetail} />
      <Route path="/player/:id" component={PlayerProfile} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/news" component={News} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalLoading() {
  const isFetching = useIsFetching();
  return <GlobalLoadingIndicator isLoading={isFetching > 0} />;
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nfl-gameday-theme">
        <FavoritesProvider>
          <TooltipProvider>
            <SkipLinks />
            <GlobalLoading />
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <header 
                    className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
                    role="banner"
                  >
                    <SidebarTrigger data-testid="button-sidebar-toggle" aria-label="Toggle sidebar navigation" />
                    <div className="flex-1 flex justify-center max-w-md mx-4">
                      <SearchTrigger />
                    </div>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                    </div>
                  </header>
                  <OfflineBanner />
                  <GlobalSearch />
                  <main id="main-content" className="flex-1 overflow-auto" role="main" aria-label="Main content">
                    <Suspense fallback={<PageLoader />}>
                      <Router />
                    </Suspense>
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
