import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Newspaper,
  Ticket,
  Users,
  Settings,
  Zap,
  Calendar,
  Star,
  Grid3X3,
  Search,
} from "lucide-react";

const mainNavItems = [
  { title: "Live Scores", url: "/", icon: Zap, badge: "LIVE" },
  { title: "Search", url: "/search", icon: Search, shortcut: "⌘K" },
  { title: "Scoreboard", url: "/scoreboard", icon: Grid3X3 },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Standings", url: "/standings", icon: Trophy },
  { title: "Teams", url: "/teams", icon: Users },
  { title: "News", url: "/news", icon: Newspaper },
];

const gameNavItems = [
  { title: "Tickets", url: "/tickets", icon: Ticket },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar id="navigation" role="navigation" aria-label="Main navigation">
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">NFL</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">NFL GameDay</span>
              <span className="text-xs text-muted-foreground">Live & Interactive</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="transition-all duration-200"
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="default" 
                          className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-5 animate-pulse"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {item.shortcut && (
                        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Game Day
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {gameNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              <Star className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Guest Fan</p>
            <p className="text-xs text-muted-foreground">Explore all features</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-settings" aria-label="Settings">
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
