"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAdminEmail, createGroup, removeAdminEmail, setGroupActive, triggerMatching } from "./actions";
import { CreateGroupForm } from "./CreateGroupForm";

export type AdminGroup = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  member_count: number;
  has_matches: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  group_name: string;
  questionnaire: "Submitted" | "Pending";
  match_status: "Matched" | "Waiting" | "Unmatched" | "—";
};

export type AdminMatch = {
  id: string;
  team: string;
  group_name: string;
  type: "pair" | "trio";
  score: number;
  top_reason: string;
};

export function AdminPanel({
  groups,
  users,
  matches,
  adminEmails,
}: {
  groups: AdminGroup[];
  users: AdminUser[];
  matches: AdminMatch[];
  adminEmails: string[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"groups" | "users" | "matches" | "admins">("groups");
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  async function handleCreate(formData: FormData) {
    setCreateError(null);
    const result = await createGroup(formData);
    if (result?.error) setCreateError(result.error);
    else router.refresh();
  }

  async function handleSetActive(groupId: string, isActive: boolean) {
    const fd = new FormData();
    fd.set("groupId", groupId);
    fd.set("isActive", String(isActive));
    await setGroupActive(fd);
    router.refresh();
  }

  async function handleTrigger(groupId: string, groupName: string) {
    if (!confirm(`This will lock all questionnaires and match users in ${groupName}. Continue?`)) return;
    setTriggerResult(null);
    setTriggeringId(groupId);
    const result = await triggerMatching(groupId);
    setTriggeringId(null);
    if (result?.error) setTriggerResult(result.error);
    else if (result?.matched != null)
      setTriggerResult(`Matched ${result.matched} users, ${result.trios ?? 0} trios, ${result.unmatched ?? 0} unmatched.`);
    router.refresh();
  }

  async function handleAddAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdminError(null);
    const fd = new FormData(e.currentTarget);
    const result = await addAdminEmail(fd);
    if (result?.error) setAdminError(result.error);
    else {
      setNewAdminEmail("");
      router.refresh();
    }
  }

  async function handleRemoveAdmin(email: string) {
    if (!confirm(`Remove ${email} from admins?`)) return;
    setAdminError(null);
    const fd = new FormData();
    fd.set("email", email);
    const result = await removeAdminEmail(fd);
    if (result?.error) setAdminError(result.error);
    else router.refresh();
  }

  const activeGroups = groups.filter((g) => g.is_active).length;
  const matchedCount = users.filter((u) => u.match_status === "Matched").length;
  const unmatchedCount = users.filter((u) => u.match_status === "Unmatched").length;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12 pb-20">
      <div className="mb-9">
        <h1 className="font-serif text-[34px] tracking-tight">Admin Panel</h1>
        <p className="mt-1 text-[14px] text-[var(--muted)]">Manage groups, users, and matching</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
          <div className="font-serif text-[36px] leading-none text-[var(--text)]">{activeGroups}</div>
          <div className="mt-1 text-[12px] text-[var(--muted)]">Active Groups</div>
        </div>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
          <div className="font-serif text-[36px] leading-none text-[var(--text)]">{users.length}</div>
          <div className="mt-1 text-[12px] text-[var(--muted)]">Total Users</div>
        </div>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
          <div className="font-serif text-[36px] leading-none text-[var(--text)]">{matches.length}</div>
          <div className="mt-1 text-[12px] text-[var(--muted)]">Matches</div>
        </div>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-5 py-5">
          <div className="font-serif text-[36px] leading-none text-[var(--text)]">{unmatchedCount}</div>
          <div className="mt-1 text-[12px] text-[var(--muted)]">Unmatched</div>
        </div>
      </div>

      <div className="mb-8 flex gap-1 border-b border-[var(--border)]">
        {(["groups", "users", "matches", "admins"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t === "groups" ? "Groups" : t === "users" ? "Users" : t === "matches" ? "Matches" : "Admins"}
          </button>
        ))}
      </div>

      {tab === "groups" && (
        <>
          {triggerResult && (
            <div className={`mb-4 rounded-lg px-3.5 py-2.5 text-[13px] ${triggerResult.startsWith("Matched") ? "border border-[var(--accent)] bg-[var(--accent-light)] text-[var(--text)]" : "border border-[#f5c6c3] bg-[#fdf1f0] text-[var(--danger)]"}`}>
              {triggerResult}
            </div>
          )}
          <CreateGroupForm onSubmit={handleCreate} error={createError} onClearError={() => setCreateError(null)} />
          <div className="mt-6 overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-[15px] font-semibold">All Groups</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Group Name
                    </th>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Code
                    </th>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Members
                    </th>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Status
                    </th>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Matching
                    </th>
                    <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]">
                      <td className="px-5 py-3.5 text-[14px]">
                        <strong>{g.name}</strong>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="rounded bg-[var(--bg)] px-2 py-0.5 text-[13px]">{g.code}</code>
                      </td>
                      <td className="px-5 py-3.5 text-[14px]">{g.member_count}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                            g.is_active ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[var(--border)] text-[var(--muted)]"
                          }`}
                        >
                          {g.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                            g.has_matches ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[#fef3e8] text-[var(--warning)]"
                          }`}
                        >
                          {g.has_matches ? "Done" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          disabled={triggeringId === g.id}
                          onClick={() => handleTrigger(g.id, g.name)}
                          className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                        >
                          {triggeringId === g.id ? "Running…" : g.has_matches ? "Re-run" : "Trigger Match"}
                        </button>
                        {g.is_active ? (
                          <button
                            type="button"
                            onClick={() => handleSetActive(g.id, false)}
                            className="ml-2 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-4 py-2 text-[13px] font-medium text-[var(--danger)] hover:bg-[#fce8e6]"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetActive(g.id, true)}
                            className="ml-2 rounded-lg border border-[var(--accent)] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[var(--accent)] hover:bg-[var(--accent-light)]"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {groups.length === 0 && (
              <p className="px-5 py-8 text-center text-[14px] text-[var(--muted)]">
                No groups yet. Create your first group above, then share the code with participants.
              </p>
            )}
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[15px] font-semibold">All Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Name
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Email
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Group
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Questionnaire
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Match Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]">
                    <td className="px-5 py-3.5 text-[14px]">
                      <strong>{u.name}</strong>
                    </td>
                    <td className="px-5 py-3.5 text-[14px]">
                      <a href={`mailto:${u.email}`} className="text-[var(--accent)] hover:underline">
                        {u.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-[14px]">{u.group_name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                          u.questionnaire === "Submitted"
                            ? "bg-[var(--accent-light)] text-[var(--accent)]"
                            : "bg-[#fef3e8] text-[var(--warning)]"
                        }`}
                      >
                        {u.questionnaire}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                          u.match_status === "Matched"
                            ? "bg-[var(--accent-light)] text-[var(--accent)]"
                            : u.match_status === "Waiting"
                              ? "bg-[#fef3e8] text-[var(--warning)]"
                              : u.match_status === "Unmatched"
                                ? "bg-[var(--border)] text-[var(--muted)]"
                                : "bg-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {u.match_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="px-5 py-8 text-center text-[14px] text-[var(--muted)]">
              No participants yet. Share your group code so people can go to Join, enter the code, then sign up.
            </p>
          )}
        </div>
      )}

      {tab === "matches" && (
        <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[15px] font-semibold">Completed Matches</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Team
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Group
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Type
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Score
                  </th>
                  <th className="bg-[var(--bg)] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Top Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)]">
                    <td className="px-5 py-3.5 text-[14px]">
                      <strong>{m.team}</strong>
                    </td>
                    <td className="px-5 py-3.5 text-[14px]">{m.group_name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                          m.type === "pair" ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[#fef3e8] text-[var(--warning)]"
                        }`}
                      >
                        {m.type === "pair" ? "Pair" : "Trio"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <strong className="text-[var(--accent)]">{m.score}%</strong>
                    </td>
                    <td className="px-5 py-3.5 text-[14px]">{m.top_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matches.length === 0 && (
            <p className="px-5 py-8 text-center text-[14px] text-[var(--muted)]">No matches yet. Trigger matching from the Groups tab.</p>
          )}
        </div>
      )}

      {tab === "admins" && (
        <div className="space-y-6">
          <p className="text-[14px] text-[var(--muted)]">Only these emails can sign in as admin. Add any email; they must have a Firebase Auth account (sign up once or use Forgot password to get a reset link).</p>
          {adminError && (
            <div className="rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">{adminError}</div>
          )}
          <form onSubmit={handleAddAdmin} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Add admin email</label>
              <input
                name="email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>
            <button type="submit" className="rounded-[10px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Add admin</button>
          </form>
          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-[15px] font-semibold">Admin emails</h3>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {adminEmails.length === 0 ? (
                <li className="px-5 py-8 text-center text-[14px] text-[var(--muted)]">No admins yet. Add one above or set ADMIN_EMAILS in .env.local to bootstrap.</li>
              ) : (
                adminEmails.map((email) => (
                  <li key={email} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-[14px]">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(email)}
                      className="rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3 py-1.5 text-[12px] font-medium text-[var(--danger)] hover:bg-[#fce8e6]"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
