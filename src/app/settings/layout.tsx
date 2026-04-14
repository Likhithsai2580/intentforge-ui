import type { Metadata } from "next";

// Settings is a personalisation UI — no value in search results
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
