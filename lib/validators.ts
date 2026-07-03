import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().min(2).max(120),
  organization: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email().max(160),
  phone: z.string().max(60).optional().or(z.literal("")),
  subject: z.string().min(3).max(180),
  message: z.string().min(10).max(5000),
  productId: z.string().optional()
});

export const productSchema = z.object({
  slug: z.string().max(160).regex(/^[\p{L}0-9]+(?:-[\p{L}0-9]+)*$/u).optional().or(z.literal("")),
  categoryId: z.string().min(1),
  tag: z.string().min(2).max(80).optional().or(z.literal("")),
  titleMn: z.string().min(2).max(220),
  titleEn: z.string().max(220).optional().or(z.literal("")),
  summaryMn: z.string().max(1000).optional().or(z.literal("")),
  summaryEn: z.string().max(1000).optional().or(z.literal("")),
  descriptionMn: z.string().max(10000).optional().or(z.literal("")),
  descriptionEn: z.string().max(10000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitleMn: z.string().max(220).optional().or(z.literal("")),
  seoTitleEn: z.string().max(220).optional().or(z.literal("")),
  seoDescriptionMn: z.string().max(500).optional().or(z.literal("")),
  seoDescriptionEn: z.string().max(500).optional().or(z.literal(""))
});

export const articleSchema = z.object({
  slug: z.string().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().optional().or(z.literal("")),
  titleMn: z.string().min(2).max(220),
  titleEn: z.string().max(220).optional().or(z.literal("")),
  excerptMn: z.string().max(700).optional().or(z.literal("")),
  excerptEn: z.string().max(700).optional().or(z.literal("")),
  bodyMn: z.string().min(10).max(50000),
  bodyEn: z.string().max(50000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitleMn: z.string().max(220).optional().or(z.literal("")),
  seoTitleEn: z.string().max(220).optional().or(z.literal("")),
  seoDescriptionMn: z.string().max(500).optional().or(z.literal("")),
  seoDescriptionEn: z.string().max(500).optional().or(z.literal(""))
});
