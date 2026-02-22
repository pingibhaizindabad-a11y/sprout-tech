"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setGroupActive } from "./actions";
import type { Group } from "@/types/database";

export function GroupRow({ group }: { group: Group }) {
  const router = useRouter();
  return (
    <li className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div>
        <Link href={`/admin/${group.id}`} className="font-medium text-zinc-900 hover:underline">
          {group.name}
        </Link>
        <p className="text-sm text-zinc-500">Code: {group.code}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${group.is_active ? "text-green-600" : "text-zinc-400"}`}>
          {group.is_active ? "Active" : "Inactive"}
        </span>
        <form
          action={async (fd) => {
            await setGroupActive(fd);
            router.refresh();
          }}
        >
          <input type="hidden" name="groupId" value={group.id} />
          <input type="hidden" name="isActive" value={String(!group.is_active)} />
          <button type="submit" className="text-sm text-zinc-600 underline hover:text-zinc-900">
            {group.is_active ? "Deactivate" : "Activate"}
          </button>
        </form>
      </div>
    </li>
  );
}
