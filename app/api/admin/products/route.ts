import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}0-9-]+/gu, "")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 1;

  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

function sanitizeFileName(name: string) {
  const ext = path.extname(name || "image.jpg").toLowerCase();
  const base = path.basename(name || "image", ext).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
  return `${Date.now()}-${base.slice(0, 80)}${ext || ".jpg"}`;
}

async function saveUploadedImage(file: File, title: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = sanitizeFileName(file.name || `${title || "product"}.jpg`);
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return `/uploads/${fileName}`;
}

export async function GET() {
  try {
    await requireAdminSession();
    const products = await db.product.findMany({
      include: { category: true, media: { include: { media: true } } },
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json(products);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const contentType = request.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};
    let uploadedFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      uploadedFile = formData.get("image") instanceof File ? (formData.get("image") as File) : null;

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          payload[key] = value;
        }
      }
    } else {
      payload = await request.json();
    }

    const parsed = productSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slugBase = createSlug(parsed.data.slug?.trim() || parsed.data.titleMn || parsed.data.titleEn || "product");
    const finalSlug = await generateUniqueSlug(slugBase || `product-${Date.now()}`);

    const product = await db.product.create({
      data: {
        ...parsed.data,
        slug: finalSlug,
        titleEn: parsed.data.titleEn || null,
        tag: parsed.data.tag?.trim() ? parsed.data.tag : null,
        summaryMn: parsed.data.summaryMn || null,
        summaryEn: parsed.data.summaryEn || null,
        descriptionMn: parsed.data.descriptionMn || null,
        descriptionEn: parsed.data.descriptionEn || null,
        seoTitleMn: parsed.data.seoTitleMn || null,
        seoTitleEn: parsed.data.seoTitleEn || null,
        seoDescriptionMn: parsed.data.seoDescriptionMn || null,
        seoDescriptionEn: parsed.data.seoDescriptionEn || null,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
      }
    });

    if (uploadedFile && uploadedFile.size > 0) {
      const imageUrl = await saveUploadedImage(uploadedFile, parsed.data.titleMn);
      const media = await db.media.create({
        data: {
          type: "IMAGE",
          url: imageUrl,
          filename: uploadedFile.name || "product-image",
          altMn: parsed.data.titleMn,
          altEn: parsed.data.titleEn || parsed.data.titleMn,
          mimeType: uploadedFile.type || "image/jpeg",
          size: uploadedFile.size
        }
      });

      await db.productMedia.create({
        data: {
          productId: product.id,
          mediaId: media.id,
          role: "GALLERY",
          sortOrder: 0
        }
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
