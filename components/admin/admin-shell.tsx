import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";

export async function AdminShell({
  children,
  title,
  activePath
}: {
  children: ReactNode;
  title: string;
  activePath: string;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/admin/login?callbackUrl=${activePath}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar activePath={activePath} />
        <main className="min-h-screen flex-1">
          <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-sm text-slate-500">{session.user.email}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Гарах
              </Button>
            </form>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
