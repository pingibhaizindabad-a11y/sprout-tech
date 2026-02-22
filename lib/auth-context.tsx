"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/client";

export type UserProfile = {
  name: string;
  email: string;
  group_id: string | null;
  questionnaire_submitted: boolean;
  is_matched: boolean;
  avatar_url?: string | null;
  bio?: string | null;
} | null;

type AuthState = {
  user: User | null;
  profile: UserProfile;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
      setUser(u ?? null);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const db = getFirebaseFirestore();
      profileUnsubRef.current = onSnapshot(
        doc(db, "users", u.uid),
        (snap) => {
          const d = snap.data();
          if (!d) {
            setProfile(null);
            return;
          }
          setProfile({
            name: (d.name as string) ?? "",
            email: (d.email as string) ?? "",
            group_id: (d.group_id as string) ?? null,
            questionnaire_submitted: (d.questionnaire_submitted as boolean) ?? false,
            is_matched: (d.is_matched as boolean) ?? false,
            avatar_url: d.avatar_url,
            bio: d.bio,
          });
        },
        (err) => {
          if (err?.code === "permission-denied") setProfile(null);
        }
      );
      setLoading(false);
    });
    return () => {
      unsubAuth();
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
