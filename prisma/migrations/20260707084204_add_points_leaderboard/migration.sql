-- CreateEnum
CREATE TYPE "PointStatus" AS ENUM ('VALIDATED', 'INVALIDATED');

-- CreateTable
CREATE TABLE "point_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "PointStatus" NOT NULL DEFAULT 'VALIDATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pointHistoryId" TEXT,
    "totalPoint" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "point_history_userId_idx" ON "point_history"("userId");

-- CreateIndex
CREATE INDEX "point_history_skillId_idx" ON "point_history"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "points_userId_key" ON "points"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "points_pointHistoryId_key" ON "points"("pointHistoryId");

-- CreateIndex
CREATE INDEX "points_userId_idx" ON "points"("userId");

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_pointHistoryId_fkey" FOREIGN KEY ("pointHistoryId") REFERENCES "point_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
