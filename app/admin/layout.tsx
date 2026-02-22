import { ensureAdminSession } from "./actions";
import { AdminGate } from "./AdminGate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await ensureAdminSession();
  if (!ok) return <AdminGate>{children}</AdminGate>;
  return <>{children}</>;
}
