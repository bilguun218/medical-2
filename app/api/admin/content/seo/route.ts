import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { saveSeoRecords, seoSettingsSchema } from "@/lib/cms";
import { revalidateSeoContent } from "@/lib/revalidation";

export async function PATCH(request: Request) {
  try {
    await requireAdminSession();
    const payload = await request.json();
    const parsed = seoSettingsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await saveSeoRecords(parsed.data.records);
    revalidateSeoContent(parsed.data.records.map((record) => record.route));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
