import type { ReactNode } from "react";

export const metadata = {
  title: "NOVYTAS Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root min-h-screen" lang="mn">
      {children}
    </div>
  );
}
