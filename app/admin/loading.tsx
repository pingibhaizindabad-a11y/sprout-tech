export default function AdminLoading() {
  return (
    <div className="min-h-[calc(100vh-61px)] bg-[var(--bg)]">
      <main className="mx-auto max-w-[960px] px-6 py-12">
        <div className="mb-9">
          <div className="h-9 w-48 animate-pulse rounded bg-[var(--border)]" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--border)]" />
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
              <div className="h-9 w-12 animate-pulse rounded bg-[var(--border)]" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[var(--border)]" />
            </div>
          ))}
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-[var(--border)]" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-[14px] bg-[var(--border)]" />
      </main>
    </div>
  );
}
