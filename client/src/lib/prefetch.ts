import { queryClient } from "./queryClient";

const COMMON_PREFETCH_PATHS = [
  "/api/games",
  "/api/standings",
  "/api/news",
  "/api/teams"
];

export function prefetchCommonData(): void {
  COMMON_PREFETCH_PATHS.forEach((path) => {
    queryClient.prefetchQuery({
      queryKey: [path],
      staleTime: 1000 * 60 * 5
    });
  });
}

export function prefetchOnHover(path: string): void {
  if (typeof document === "undefined") return;
  
  const links = document.querySelectorAll<HTMLAnchorElement>(`a[href="${path}"]`);
  
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const apiPath = getApiPathForRoute(path);
      if (apiPath) {
        queryClient.prefetchQuery({
          queryKey: [apiPath],
          staleTime: 1000 * 60 * 2
        });
      }
    }, { once: true });
  });
}

function getApiPathForRoute(route: string): string | null {
  const routeToApi: Record<string, string> = {
    "/": "/api/games",
    "/scoreboard": "/api/games",
    "/standings": "/api/standings",
    "/news": "/api/news",
    "/teams": "/api/teams",
    "/schedule": "/api/schedule"
  };
  
  return routeToApi[route] || null;
}

export function prefetchRoute(route: string): void {
  const apiPath = getApiPathForRoute(route);
  if (apiPath) {
    queryClient.prefetchQuery({
      queryKey: [apiPath],
      staleTime: 1000 * 60 * 2
    });
  }
}

export const prefetch = {
  commonData: prefetchCommonData,
  onHover: prefetchOnHover,
  route: prefetchRoute
};

export default prefetch;
