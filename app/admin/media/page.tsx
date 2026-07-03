import { ImageIcon, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getMedia() {
  try {
    return await db.media.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminMediaPage() {
  const media = await getMedia();

  return (
    <AdminShell title="Media library" activePath="/admin/media">
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <Upload className="h-5 w-5 text-teal" />
            <CardTitle>Upload pipeline</CardTitle>
            <CardDescription>
              The schema supports images, PDFs, and documents. Production uploads should connect this page to object storage or a private file service.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>{media.length} files</CardDescription>
          </CardHeader>
          <div className="grid gap-3 px-6 pb-6">
            {media.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 text-teal" />
                  <div>
                    <p className="font-medium">{item.filename}</p>
                    <p className="text-slate-500">{item.type} · {formatDate(item.createdAt, "en")}</p>
                  </div>
                </div>
                <a className="font-semibold text-medical" href={item.url}>
                  Open
                </a>
              </div>
            ))}
            {media.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No media files yet.</p> : null}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
