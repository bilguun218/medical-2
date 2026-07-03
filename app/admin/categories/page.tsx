import { FolderTree } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productCategories } from "@/content/novytas";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    return await db.productCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  } catch {
    return [];
  }
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <AdminShell title="Categories" activePath="/admin/categories">
      <div className="grid gap-4 md:grid-cols-3">
        {(categories.length > 0 ? categories : productCategories).map((category) => (
          <Card key={category.slug}>
            <CardHeader>
              <FolderTree className="h-5 w-5 text-teal" />
              <CardTitle>{"titleMn" in category ? category.titleMn : category.title.mn}</CardTitle>
              <CardDescription>
                {"descriptionMn" in category ? category.descriptionMn : category.description.mn}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
