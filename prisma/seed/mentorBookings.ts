import { addMinutes, randomFutureDate } from '../../src/common/helpers/date-time';
import { PrismaClient, MentorBookingStatus, MentorSpotStatus, InterviewRequestStatus } from '@prisma/client';

export async function seedMentorBookings(
  prisma: PrismaClient,
  userMap: Record<string, { id: string }>,
  examMap: Record<string, { id: string }>,
  mentors: {
    id: string;
    user: { email: string };
  }[]
) {
  const userEmails = Object.keys(userMap).filter(
    (email) =>
      email.includes('user') &&
      !email.includes('mentor') &&
      !email.includes('admin') &&
      !email.includes('company') &&
      !email.includes('examiner')
  );

  const statuses = [MentorBookingStatus.UPCOMING, MentorBookingStatus.COMPLETED, MentorBookingStatus.NOT_JOINED];

  let count = 0;

  for (let i = 0; i < userEmails.length; i++) {
    const userEmail = userEmails[i];
    const userId = userMap[userEmail]?.id;
    const examId = examMap[userId]?.id;

    if (!userId || !examId) continue;

    /** 1️⃣ InterviewRequest (idempotent) */
    const interviewRequest = await prisma.interviewRequest.upsert({
      where: { examId },
      update: {},
      create: {
        examId,
        status: InterviewRequestStatus.PENDING,
      },
    });

    /** 2️⃣ Assign mentor (round-robin) */
    const mentor = mentors[i % mentors.length];

    /** 3️⃣ Create MentorTimeSpot */
    const startAt = randomFutureDate();
    const endAt = addMinutes(startAt, 60);

    const timeSpot = await prisma.mentorTimeSpot.create({
      data: {
        mentorId: mentor.id,
        startAt,
        endAt,
        durationMinutes: 60,
        timezone: 'Asia/Ho_Chi_Minh',
        status: MentorSpotStatus.BOOKED,
      },
    });

    /** 4️⃣ Attach spot to InterviewRequest */
    await prisma.interviewRequest.update({
      where: { id: interviewRequest.id },
      data: {
        currentSpotId: timeSpot.id,
        status: InterviewRequestStatus.ASSIGNED,
      },
    });

    /** 5️⃣ MentorBooking */
    await prisma.mentorBooking.create({
      data: {
        mentorId: mentor.id,
        interviewRequestId: interviewRequest.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: `Session between ${userEmail} and ${mentor.user.email}`,
      },
    });

    count++;
  }

  console.log(`✅ Seeded ${count} mentor bookings`);
}
