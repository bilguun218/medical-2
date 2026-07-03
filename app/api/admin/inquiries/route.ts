import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;
    const inquiries = await db.contactInquiry.findMany({
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
    return NextResponse.json(inquiries);
  } catch (error) {
    return apiError(error);
  }
}
