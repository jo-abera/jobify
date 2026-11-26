ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "workMode" TEXT NOT NULL DEFAULT 'On-site';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT NOT NULL DEFAULT 'Not specified';
CREATE INDEX IF NOT EXISTS "Job_workMode_idx" ON "Job"("workMode");
CREATE INDEX IF NOT EXISTS "Job_experienceLevel_idx" ON "Job"("experienceLevel");