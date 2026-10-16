import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/**
 * Shared fallback for the /dashboard route's errorComponent and
 * notFoundComponent. Lives in its own module so the router's code-splitter
 * can extract it cleanly.
 */
export function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The demo dashboard could not load. Return to the website and try again.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/">Back to website</Link>
        </Button>
      </div>
    </div>
  );
}
