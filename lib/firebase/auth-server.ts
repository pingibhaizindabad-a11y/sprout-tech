import { cookies } from "next/headers";
import { getUidFromToken } from "./admin";

const AUTH_COOKIE = "sprout_id_token";
const MAX_AGE = 60 * 60; // 1 hour

export async function setAuthCookie(idToken: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, idToken, { path: "/", httpOnly: true, sameSite: "lax", maxAge: MAX_AGE, secure: process.env.NODE_ENV === "production" });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getCurrentUid(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return getUidFromToken(token);
}
