import { AdminShell } from "@/components/admin/admin-shell";
import { VisualContentEditor } from "@/components/admin/content/visual-content-editor";
import { getCmsContent } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminVisualContentPage() {
  const [home, about, contact, header, footer] = await Promise.all([
    getCmsContent("home"),
    getCmsContent("about"),
    getCmsContent("contact"),
    getCmsContent("header"),
    getCmsContent("footer")
  ]);

  return (
    <AdminShell title="Контент: Visual editor" activePath="/admin/content/visual">
      <VisualContentEditor initialValue={{ home, about, contact, header, footer }} />
    </AdminShell>
  );
}
