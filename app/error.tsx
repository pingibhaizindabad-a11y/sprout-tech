"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <h1 className="font-serif text-2xl text-[var(--text)]">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-[var(--muted)]">
        {error.message?.includes("Firebase") || error.message?.includes("configured")
          ? "Firebase is not configured or failed to connect. Add the required variables to .env.local and restart the dev server."
          : "An unexpected error occurred. Try refreshing the page."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-[10px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
      >
        Try again
      </button>
    </div>
  );
}
