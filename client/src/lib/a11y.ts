let liveRegion: HTMLDivElement | null = null;

function getLiveRegion(): HTMLDivElement {
  if (liveRegion) return liveRegion;
  
  liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  liveRegion.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(liveRegion);
  
  return liveRegion;
}

export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const region = getLiveRegion();
  region.setAttribute("aria-live", priority);
  
  region.textContent = "";
  
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

export function announceScoreUpdate(homeTeam: string, homeScore: number, awayTeam: string, awayScore: number): void {
  announce(`Score update: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}`, "polite");
}

export function announceGameStatus(status: string): void {
  announce(status, "assertive");
}

export function focusElement(selector: string): boolean {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.focus();
    return true;
  }
  return false;
}

export function focusFirst(container: HTMLElement | null): boolean {
  if (!container) return false;
  
  const focusableSelector = `
    a[href]:not([disabled]),
    button:not([disabled]),
    textarea:not([disabled]),
    input[type="text"]:not([disabled]),
    input[type="radio"]:not([disabled]),
    input[type="checkbox"]:not([disabled]),
    select:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `.replace(/\s+/g, " ").trim();
  
  const focusable = container.querySelector<HTMLElement>(focusableSelector);
  if (focusable) {
    focusable.focus();
    return true;
  }
  return false;
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableSelector = `
    a[href]:not([disabled]),
    button:not([disabled]),
    textarea:not([disabled]),
    input:not([disabled]),
    select:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `.replace(/\s+/g, " ").trim();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener("keydown", handleKeyDown);
  
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

export function handleArrowNavigation(
  e: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: { 
    loop?: boolean; 
    orientation?: "horizontal" | "vertical" | "both" 
  } = {}
): number {
  const { loop = true, orientation = "both" } = options;
  
  const isVertical = orientation === "vertical" || orientation === "both";
  const isHorizontal = orientation === "horizontal" || orientation === "both";
  
  let newIndex = currentIndex;

  if ((e.key === "ArrowDown" && isVertical) || (e.key === "ArrowRight" && isHorizontal)) {
    e.preventDefault();
    newIndex = currentIndex + 1;
    if (newIndex >= items.length) {
      newIndex = loop ? 0 : items.length - 1;
    }
  } else if ((e.key === "ArrowUp" && isVertical) || (e.key === "ArrowLeft" && isHorizontal)) {
    e.preventDefault();
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = loop ? items.length - 1 : 0;
    }
  } else if (e.key === "Home") {
    e.preventDefault();
    newIndex = 0;
  } else if (e.key === "End") {
    e.preventDefault();
    newIndex = items.length - 1;
  }

  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }

  return newIndex;
}

export function getAriaLabel(type: "score" | "status" | "team" | "player", data: Record<string, unknown>): string {
  switch (type) {
    case "score":
      return `${data.team} score: ${data.score}`;
    case "status":
      return `Game status: ${data.status}`;
    case "team":
      return `${data.name}, record: ${data.wins} wins, ${data.losses} losses`;
    case "player":
      return `${data.name}, ${data.position}, number ${data.jersey}`;
    default:
      return "";
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getContrastRatio(color1: string, color2: string): number {
  function getLuminance(hex: string): number {
    const rgb = hex.replace("#", "").match(/.{2}/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c, 16) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}
