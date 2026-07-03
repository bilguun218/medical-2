import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, media: { include: { media: true } } }
    });
    return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const payload = await request.json();
    const parsed = productSchema.partial().safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : parsed.data.status === "DRAFT" ? null : undefined
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
