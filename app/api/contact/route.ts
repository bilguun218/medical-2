import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactInquirySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = contactInquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const inquiry = await db.contactInquiry.create({
      data: {
        name: parsed.data.name,
        organization: parsed.data.organization || null,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        productId: parsed.data.productId || null
      }
    });

    return NextResponse.json({ id: inquiry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create inquiry" }, { status: 500 });
  }
}
