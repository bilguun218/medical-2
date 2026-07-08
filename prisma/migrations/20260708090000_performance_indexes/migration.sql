CREATE INDEX IF NOT EXISTS "ProductCategory_sortOrder_createdAt_idx" ON "ProductCategory"("sortOrder", "createdAt");

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_status_publishedAt_createdAt_idx" ON "Product"("status", "publishedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_updatedAt_idx" ON "Product"("updatedAt");

CREATE INDEX IF NOT EXISTS "ProductMedia_productId_sortOrder_idx" ON "ProductMedia"("productId", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProductMedia_mediaId_idx" ON "ProductMedia"("mediaId");

CREATE INDEX IF NOT EXISTS "NewsCategory_titleMn_idx" ON "NewsCategory"("titleMn");

CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_authorId_idx" ON "Article"("authorId");
CREATE INDEX IF NOT EXISTS "Article_coverImageId_idx" ON "Article"("coverImageId");
CREATE INDEX IF NOT EXISTS "Article_status_publishedAt_createdAt_idx" ON "Article"("status", "publishedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "Article_updatedAt_idx" ON "Article"("updatedAt");

CREATE INDEX IF NOT EXISTS "Media_type_createdAt_idx" ON "Media"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "Media_createdAt_idx" ON "Media"("createdAt");
CREATE INDEX IF NOT EXISTS "Media_url_idx" ON "Media"("url");

CREATE INDEX IF NOT EXISTS "ContactInquiry_productId_idx" ON "ContactInquiry"("productId");
CREATE INDEX IF NOT EXISTS "ContactInquiry_status_createdAt_idx" ON "ContactInquiry"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ContactInquiry_createdAt_idx" ON "ContactInquiry"("createdAt");
CREATE INDEX IF NOT EXISTS "ContactInquiry_updatedAt_idx" ON "ContactInquiry"("updatedAt");
