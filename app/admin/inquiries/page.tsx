import { MessageSquare } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ q?: string; status?: string }> };

async function getInquiries(q?: string, status?: string) {
  try {
    return await db.contactInquiry.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { subject: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
  } catch {
    return [];
  }
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;
  const inquiries = await getInquiries(q, status);

  return (
    <AdminShell title="Inquiries" activePath="/admin/inquiries">
      <Card>
        <CardHeader>
          <CardTitle>Contact requests</CardTitle>
          <CardDescription>Filter requests by status or search by sender and subject.</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <form className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input name="q" defaultValue={q ?? ""} placeholder="Search" />
            <select name="status" defaultValue={status ?? ""} className="h-11 rounded-lg border bg-white px-3 text-sm">
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="IN_REVIEW">In review</option>
              <option value="REPLIED">Replied</option>
              <option value="CLOSED">Closed</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-teal" />
                      <p className="font-semibold">{inquiry.subject}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {inquiry.name} · {inquiry.email} · {formatDate(inquiry.createdAt, "en")}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{inquiry.message}</p>
                  </div>
                  <Badge>{inquiry.status}</Badge>
                </div>
              </div>
            ))}
            {inquiries.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No inquiries yet.</p> : null}
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}
