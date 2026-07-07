import Link from "next/link";
import {
  BarChart3,
  FileText,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { href: "/admin/dashboard", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: BarChart3 },
  { href: "/admin/categories", label: "Ангилал", icon: FolderTree },
  { href: "/admin/news", label: "Мэдээ", icon: Newspaper },
  { href: "/admin/inquiries", label: "Санал хүсэлт", icon: MessageSquare },
  { href: "/admin/media", label: "Медиа", icon: ImageIcon },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
  { href: "/admin/profile", label: "Профайл", icon: UserCircle }
];

const contentItems = [
  { href: "/admin/content/visual", label: "Visual editor", icon: FileText }
];

function isActive(activePath: string | undefined, href: string) {
  if (activePath === href) {
    return true;
  }

  return href === "/admin/content/visual" && Boolean(activePath?.startsWith("/admin/content"));
}

export function AdminSidebar({ activePath }: { activePath?: string }) {
  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 border-r bg-slate-950 text-white lg:block">
        <div className="border-b border-white/10 p-6">
          <p className="text-lg font-semibold">NOVYTAS Админ</p>
          <p className="mt-1 text-sm text-white/55">Дотоод удирдлагын систем</p>
        </div>
        <nav className="grid gap-1 p-4">
          {primaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
                isActive(activePath, item.href) && "bg-white/10 text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-2 flex items-center gap-3 px-3 text-xs font-semibold uppercase tracking-normal text-white/45">
              <FileText className="h-4 w-4" />
              Контент
            </div>
            <div className="grid gap-1">
              {contentItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-8 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
                    isActive(activePath, item.href) && "bg-white/10 text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950 text-white lg:hidden">
        <div className="px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">NOVYTAS Админ</p>
            <p className="text-xs text-white/55">Дотоод удирдлагын систем</p>
          </div>
        </div>
        <nav className="flex snap-x gap-2 overflow-x-auto px-3 pb-3">
          {[...primaryItems, ...contentItems].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white",
                isActive(activePath, item.href) && "bg-white/10 text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
