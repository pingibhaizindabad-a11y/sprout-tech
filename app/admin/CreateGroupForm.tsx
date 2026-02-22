"use client";

import { useState } from "react";

export function CreateGroupForm({
  onSubmit,
  error,
  onClearError,
}: {
  onSubmit: (formData: FormData) => Promise<void>;
  error: string | null;
  onClearError: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await onSubmit(new FormData(e.currentTarget));
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-7"
    >
      <h3 className="mb-5 text-[16px] font-semibold">Create New Group</h3>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Group Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="e.g. E-Cell Cohort 2025"
            className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Custom Code
          </label>
          <input
            name="code"
            type="text"
            placeholder="e.g. ECELL25"
            maxLength={10}
            className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[14px] uppercase text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
            onInput={(e) => {
              (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase();
            }}
          />
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            Create a custom join code for this group, or leave blank to auto-generate.
          </p>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-[10px] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Group"}
      </button>
    </form>
  );
}
