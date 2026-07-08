import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { cmsSchemas, saveCmsContent, type CmsKey } from "@/lib/cms";
import { revalidateCmsContent } from "@/lib/revalidation";

const keys = Object.keys(cmsSchemas) as CmsKey[];

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    await requireAdminSession();
    const { key: rawKey } = await params;

    if (!keys.includes(rawKey as CmsKey)) {
      return NextResponse.json({ error: "Unknown content section." }, { status: 404 });
    }

    const key = rawKey as CmsKey;
    const payload = await request.json();
    const parsed = cmsSchemas[key].safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await saveCmsContent(key, parsed.data as never);
    revalidateCmsContent(key);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
