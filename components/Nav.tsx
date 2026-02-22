import Link from "next/link";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { signOut } from "@/app/auth/actions";

export async function Nav() {
  const uid = await getCurrentUid();
  const adminCookie = (await cookies()).get("sprout_admin")?.value === "1";
  let userName: string | null = null;
  if (uid) {
    const db = getAdminFirestoreIfConfigured();
    if (db) {
      const snap = await db.collection("users").doc(uid).get();
      userName = snap.data()?.name ?? null;
    }
  }

  const isAdmin = adminCookie;
  const isUser = !!uid && !isAdmin;

  return (
    <nav className="sticky top-0 z-[200] flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4 sm:px-12">
      <Link href="/" className="font-serif text-[22px] text-[var(--accent)]">
        Sprout
      </Link>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <>
            <span className="text-[13px] text-[var(--muted)]">Admin Panel</span>
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]">
                Log out
              </button>
            </form>
          </>
        )}
        {isUser && (
          <>
            <span className="text-[13px] text-[var(--muted)]">{userName ?? "User"}</span>
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]">
              Dashboard
            </Link>
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]">
                Log out
              </button>
            </form>
          </>
        )}
        {!uid && !isAdmin && (
          <>
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]">
              Admin
            </Link>
            <Link href="/auth" className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]">
              Log in
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
