-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'REMINDER', 'SUCCESS', 'WARNING', 'OVERDUE');

-- AlterTable
ALTER TABLE "BorrowRequest" ADD COLUMN     "fine" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'INFO';
