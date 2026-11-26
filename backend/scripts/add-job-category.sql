-- Safe migration: add category column only (no resume / other table changes).
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Other';
CREATE INDEX IF NOT EXISTS "Job_category_idx" ON "Job"("category");