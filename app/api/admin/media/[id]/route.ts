import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { apiError, requireAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { deleteStoredMediaFile } from "@/lib/media";
import { revalidateMediaContent, revalidateNewsContent, revalidateProductContent } from "@/lib/revalidation";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const media = await db.media.findUnique({
      where: { id },
      include: {
        productMedia: { select: { productId: true } },
        articleCovers: { select: { id: true } }
      }
    });

    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sameUrlCount = await db.media.count({
      where: {
        url: media.url,
        id: { not: id }
      }
    });

    await db.media.delete({ where: { id } });

    let fileDeleted = false;
    let warning: string | undefined;

    if (sameUrlCount === 0) {
      try {
        await deleteStoredMediaFile(media.url);
        fileDeleted = true;
      } catch {
        warning = "Медиа бүртгэл устсан боловч хадгалсан файлыг устгах үед алдаа гарлаа.";
      }
    }

    revalidatePath("/admin/media");
    revalidatePath("/admin/products");
    revalidatePath("/admin/news");
    revalidateMediaContent();

    for (const productMedia of media.productMedia) {
      revalidateProductContent(productMedia.productId);
    }

    for (const article of media.articleCovers) {
      revalidateNewsContent(article.id);
    }

    return NextResponse.json({ ok: true, fileDeleted, warning });
  } catch (error) {
    return apiError(error);
  }
}
