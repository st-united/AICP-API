import { PrismaClient, MentorBookingStatus } from '@prisma/client';

export async function seedMentorBookings(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  examMap: { [userId: string]: { id: string } },
  mentors: any[]
) {
  const mentorEmails = mentors.map((mentor) => mentor.user.email);
  const userEmails = Object.keys(userMap).filter((email) => {
    return (
      email.includes('user') &&
      !email.includes('mentor') &&
      !email.includes('admin') &&
      !email.includes('company') &&
      !email.includes('examiner')
    );
  });

  function randomFutureDate(daysAhead = 30): Date {
    const randomDays = Math.floor(Math.random() * daysAhead) + 1;
    const date = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const timeSlots = ['AM_08_09', 'AM_09_10', 'AM_10_11', 'AM_11_12', 'PM_02_03', 'PM_03_04', 'PM_04_05', 'PM_05_06'];
  const statuses = [
    MentorBookingStatus.ACCEPTED,
    MentorBookingStatus.PENDING,
    MentorBookingStatus.REJECTED,
    MentorBookingStatus.COMPLETED,
    MentorBookingStatus.CANCELLED,
  ];

  const mentorEmailMap = Object.fromEntries(mentors.map((mentor) => [mentor.user.email, mentor]));

  for (const mentorEmail of mentorEmails) {
    const mentor = mentorEmailMap[mentorEmail];
    for (let i = 0; i < 20; i++) {
      const menteeIndex = Math.floor(Math.random() * userEmails.length);
      const userEmail = userEmails[menteeIndex];
      const userId = userMap[userEmail]?.id;
      const examId = examMap[userId]?.id;

      if (!userId || !examId) continue;

      // 1. Tạo InterviewRequest
      const interviewRequest = await prisma.interviewRequest.create({
        data: {
          userId,
          examId,
          interviewDate: randomFutureDate(),
        },
      });

      // 2. Tạo MentorBooking
      await prisma.mentorBooking.create({
        data: {
          interviewRequestId: interviewRequest.id,
          mentorId: mentor.id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          notes: `Session between ${userEmail} and ${mentorEmail}`,
        },
      });
    }
  }
}
