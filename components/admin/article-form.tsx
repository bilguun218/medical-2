"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { articleSchema } from "@/lib/validators";

type ArticleFormValues = z.infer<typeof articleSchema>;

export function ArticleForm({ categories }: { categories: Array<{ id: string; titleMn: string; titleEn: string }> }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      slug: "",
      categoryId: "",
      titleMn: "",
      titleEn: "",
      excerptMn: "",
      excerptEn: "",
      bodyMn: "",
      bodyEn: "",
      status: "DRAFT",
      seoTitleMn: "",
      seoTitleEn: "",
      seoDescriptionMn: "",
      seoDescriptionEn: ""
    }
  });

  async function onSubmit(values: ArticleFormValues) {
    setMessage(null);
    const response = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setMessage("Unable to save article.");
      return;
    }

    form.reset();
    router.refresh();
    setMessage("Article saved.");
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Slug</Label>
          <Input {...form.register("slug")} />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <select className="h-11 rounded-lg border bg-white px-3 text-sm" {...form.register("status")}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <select className="h-11 rounded-lg border bg-white px-3 text-sm" {...form.register("categoryId")}>
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.titleMn}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Title MN</Label>
          <Input {...form.register("titleMn")} />
        </div>
        <div className="grid gap-2">
          <Label>Title EN</Label>
          <Input {...form.register("titleEn")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Excerpt MN</Label>
          <Textarea {...form.register("excerptMn")} />
        </div>
        <div className="grid gap-2">
          <Label>Excerpt EN</Label>
          <Textarea {...form.register("excerptEn")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Body MN</Label>
          <Textarea className="min-h-56" {...form.register("bodyMn")} />
        </div>
        <div className="grid gap-2">
          <Label>Body EN</Label>
          <Textarea className="min-h-56" {...form.register("bodyEn")} />
        </div>
      </div>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save article
      </Button>
    </form>
  );
}
