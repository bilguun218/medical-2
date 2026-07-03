import { SearchCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSeoSettings() {
  try {
    return await db.seoSetting.findMany({ orderBy: { route: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminSeoPage() {
  const settings = await getSeoSettings();

  return (
    <AdminShell title="SEO settings" activePath="/admin/seo">
      <Card>
        <CardHeader>
          <SearchCheck className="h-5 w-5 text-teal" />
          <CardTitle>Route metadata</CardTitle>
          <CardDescription>Canonical URL, Open Graph image, noindex, and bilingual title/description records are modeled in Prisma.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-3">Route</th>
                <th className="py-3">MN title</th>
                <th className="py-3">EN title</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3">{item.route}</td>
                  <td className="py-3">{item.titleMn}</td>
                  <td className="py-3">{item.titleEn}</td>
                </tr>
              ))}
              {settings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No custom SEO records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
