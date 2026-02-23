import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/lib/auth-context";
import { FirebaseEnvGuard } from "@/components/FirebaseEnvGuard";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Sprout — Find Your Match",
  description: "Join your group, answer a few questions, and get matched with someone who truly complements your skills and style.",
};

const FIREBASE_CLIENT_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV === "development") {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      console.warn("Firebase project: undefined — add NEXT_PUBLIC_FIREBASE_* to .env.local and restart dev server.");
    } else {
      console.log("Firebase project:", projectId);
    }
  }
  const firebaseEnvFromServer = FIREBASE_CLIENT_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: process.env[key] ?? "" }),
    {} as Record<string, string>
  );
  const firebaseEnvScript = `window.__FIREBASE_ENV__=${JSON.stringify(firebaseEnvFromServer)}`;
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-[var(--bg)] text-[var(--text)]" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: firebaseEnvScript }} />
        <FirebaseEnvGuard firebaseEnvFromServer={firebaseEnvFromServer}>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </FirebaseEnvGuard>
      </body>
    </html>
  );
}
