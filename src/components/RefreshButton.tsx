'use client';

import { RefreshCw } from 'lucide-react';

/**
 * Permanent floating refresh button in top-right corner.
 * Always visible on all pages to rescue from app freezes or blackouts.
 */
export function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className="fixed top-3 right-3 z-[9999] p-2 rounded-full bg-background/60 border border-border/50 shadow-sm opacity-40 hover:opacity-100 hover:bg-background hover:border-border hover:shadow-md transition-all duration-200"
      aria-label="Refresh page"
      title="Refresh page"
    >
      <RefreshCw className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
