-- Optional profile link columns for completion indicator
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "githubUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT;