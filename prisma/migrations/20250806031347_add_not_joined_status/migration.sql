BEGIN;

-- 1. Bỏ default để tránh conflict
ALTER TABLE "MentorBooking" ALTER COLUMN "status" DROP DEFAULT;

-- 2. Tạm đổi column thành TEXT
ALTER TABLE "MentorBooking" 
  ALTER COLUMN "status" TYPE text USING "status"::text;

-- 3. Map dữ liệu cũ sang giá trị mới
UPDATE "MentorBooking"
SET "status" = CASE
  WHEN "status" = 'PENDING'   THEN 'UPCOMING'
  WHEN "status" = 'ACCEPTED'  THEN 'COMPLETED'
  WHEN "status" = 'REJECTED'  THEN 'NOT_JOINED'
  WHEN "status" = 'CANCELLED' THEN 'NOT_JOINED'
  WHEN "status" = 'COMPLETED' THEN 'COMPLETED'
  ELSE 'UPCOMING'
END;

-- 4. Xóa enum cũ & tạo enum mới
DROP TYPE IF EXISTS "MentorBookingStatus";
CREATE TYPE "MentorBookingStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'NOT_JOINED');

-- 5. Đổi column từ TEXT sang enum mới
ALTER TABLE "MentorBooking"
  ALTER COLUMN "status" TYPE "MentorBookingStatus" USING "status"::"MentorBookingStatus";

-- 6. Đặt default mới
ALTER TABLE "MentorBooking" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

COMMIT;
