import Link from "next/link";
import {
  BarChart3,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  SearchCheck,
  Settings,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: BarChart3 },
  { href: "/admin/categories", label: "Ангилал", icon: FolderTree },
  { href: "/admin/news", label: "Мэдээ", icon: Newspaper },
  { href: "/admin/inquiries", label: "Лавлагаа", icon: MessageSquare },
  { href: "/admin/media", label: "Медиа", icon: ImageIcon },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
  { href: "/admin/seo", label: "SEO", icon: SearchCheck },
  { href: "/admin/profile", label: "Профайл", icon: UserCircle }
];

export function AdminSidebar({ activePath }: { activePath?: string }) {
  return (
    <aside className="hidden min-h-screen w-72 border-r bg-slate-950 text-white lg:block">
      <div className="border-b border-white/10 p-6">
        <p className="text-lg font-semibold">NOVYTAS Admin</p>
        <p className="mt-1 text-sm text-white/55">Дотоод удирдлагын систем</p>
      </div>
      <nav className="grid gap-1 p-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white",
              activePath === item.href && "bg-white/10 text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
