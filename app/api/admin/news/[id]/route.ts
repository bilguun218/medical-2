import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { articleSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const payload = await request.json();
    const parsed = articleSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...parsed.data,
        categoryId: parsed.data.categoryId || undefined,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : parsed.data.status === "DRAFT" ? null : undefined
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
