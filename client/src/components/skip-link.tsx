import { memo } from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SkipLink = memo(function SkipLink({ 
  href = "#main-content", 
  className,
  children = "Skip to main content"
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
      data-testid="skip-link"
    >
      {children}
    </a>
  );
});

interface SkipLinksProps {
  links?: Array<{ href: string; label: string }>;
}

export const SkipLinks = memo(function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
  ];

  const allLinks = links || defaultLinks;

  return (
    <div className="sr-only focus-within:not-sr-only" data-testid="skip-links-container">
      {allLinks.map((link, index) => (
        <SkipLink key={index} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </div>
  );
});
