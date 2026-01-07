import { addMinutes, randomFutureDate } from '@app/common/helpers/date-time';
import { PrismaClient, MentorBookingStatus, MentorSpotStatus, InterviewRequestStatus } from '@prisma/client';

export async function seedInterviewRequest(
  prisma: PrismaClient,
  userMap: Record<string, { id: string }>,
  examMap: Record<string, { id: string }>,
  mentors: {
    id: string;
    user: { email: string };
  }[]
) {
  console.log('🌱 Seeding interview flow...');

  const menteeEmails = Object.keys(userMap).filter(
    (email) =>
      email.includes('user') && !email.includes('mentor') && !email.includes('admin') && !email.includes('company')
  );

  let createdCount = 0;

  for (let i = 0; i < menteeEmails.length; i++) {
    const menteeEmail = menteeEmails[i];
    const userId = userMap[menteeEmail]?.id;
    const examId = examMap[userId]?.id;

    if (!examId) continue;

    /** 1️⃣ InterviewRequest (idempotent) */
    const interviewRequest = await prisma.interviewRequest.upsert({
      where: { examId },
      update: {},
      create: {
        examId,
        status: InterviewRequestStatus.PENDING,
      },
    });

    /** 2️⃣ Pick mentor (round-robin) */
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

    /** 5️⃣ Create MentorBooking */
    await prisma.mentorBooking.create({
      data: {
        mentorId: mentor.id,
        interviewRequestId: interviewRequest.id,
        status: MentorBookingStatus.UPCOMING,
        notes: `Interview between ${menteeEmail} and ${mentor.user.email}`,
      },
    });

    createdCount++;
  }

  console.log(`✅ Seeded ${createdCount} interview requests`);
}
