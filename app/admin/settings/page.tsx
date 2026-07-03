import { Settings } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { company } from "@/content/novytas";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Site settings" activePath="/admin/settings">
      <Card>
        <CardHeader>
          <Settings className="h-5 w-5 text-teal" />
          <CardTitle>Official source content</CardTitle>
          <CardDescription>
            Current corporate text is sourced from the supplied company profile. Missing contact fields should be completed here before publication: phone, email, address, business hours, and map embed.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-4 px-6 pb-6 text-sm text-slate-600">
          <p><strong>MN:</strong> {company.contactLine.mn}</p>
          <p><strong>EN:</strong> {company.contactLine.en}</p>
        </div>
      </Card>
    </AdminShell>
  );
}
