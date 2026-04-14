import type { Metadata } from "next";

// /pro redirects to / — no need to index this route
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
