"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { triggerMatching } from "./actions";

export function TriggerMatchingButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setLoading(true);
    const result = await triggerMatching(groupId);
    setLoading(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Running…" : "Trigger matching"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
