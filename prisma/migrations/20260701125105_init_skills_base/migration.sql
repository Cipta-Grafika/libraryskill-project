-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AUTHOR', 'REVIEWER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "SkillStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AUTHOR',
    "bio" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "outputModes" TEXT[],
    "tags" TEXT[],
    "status" "SkillStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateIndex
CREATE INDEX "skills_status_idx" ON "skills"("status");

-- CreateIndex
CREATE INDEX "skills_authorId_idx" ON "skills"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_roleSlug_slug_key" ON "skills"("roleSlug", "slug");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Superadmin User
INSERT INTO "users" ("id", "name", "email", "password", "role", "slug", "bio", "createdAt", "updatedAt") 
VALUES (
    'clyabc123000008l412345678', 
    'Super Admin', 
    'superadmin@example.com', 
    '$2b$10$HqnLwsE8v5YgSuabqR0VpeusTBHhf4f.K4kxAs8klL.GpdZ3iAUxa', 
    'SUPERADMIN', 
    'super-admin', 
    'System Administrator', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);
