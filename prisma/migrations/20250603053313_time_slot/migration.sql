-- CreateEnum
CREATE TYPE "TimeSlotBooking" AS ENUM ('AM_08_09', 'AM_09_10', 'AM_10_11', 'AM_11_12', 'PM_02_03', 'PM_03_04', 'PM_04_05', 'PM_05_06');

-- AlterTable
ALTER TABLE "MentorBooking" ADD COLUMN     "time_slot" "TimeSlotBooking",
ALTER COLUMN "scheduled_at" SET DATA TYPE DATE;
