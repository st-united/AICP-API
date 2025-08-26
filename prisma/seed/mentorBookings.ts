import { PrismaClient, MentorBookingStatus, TimeSlotBooking } from '@prisma/client';

export async function seedMentorBookings(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
  examMap: { [userId: string]: { id: string } },
  mentors: any[]
) {
  const mentorEmails = mentors.map((mentor) => mentor.user.email);
  const userEmails = Object.keys(userMap).filter(
    (email) =>
      email.includes('user') &&
      !email.includes('mentor') &&
      !email.includes('admin') &&
      !email.includes('company') &&
      !email.includes('examiner')
  );

  function randomFutureDate(daysAhead = 30): Date {
    const randomDays = Math.floor(Math.random() * daysAhead) + 1;
    const date = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const timeSlots = [
    TimeSlotBooking.AM_08_09,
    TimeSlotBooking.AM_09_10,
    TimeSlotBooking.AM_10_11,
    TimeSlotBooking.AM_11_12,
    TimeSlotBooking.PM_02_03,
    TimeSlotBooking.PM_03_04,
    TimeSlotBooking.PM_04_05,
    TimeSlotBooking.PM_05_06,
  ];

  const statuses = [MentorBookingStatus.UPCOMING, MentorBookingStatus.COMPLETED, MentorBookingStatus.NOT_JOINED];

  const mentorEmailMap = Object.fromEntries(mentors.map((mentor) => [mentor.user.email, mentor]));

  for (const mentorEmail of mentorEmails) {
    const mentor = mentorEmailMap[mentorEmail];

    for (let i = 0; i < 20; i++) {
      const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
      const userId = userMap[userEmail]?.id;
      const examId = examMap[userId]?.id;
      if (!userId || !examId) continue;

      let interviewRequest;
      try {
        interviewRequest = await prisma.interviewRequest.create({
          data: {
            examId,
            interviewDate: randomFutureDate(),
            timeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
          },
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          interviewRequest = await prisma.interviewRequest.findUnique({
            where: { examId },
          });
        } else {
          throw error;
        }
      }

      if (!interviewRequest) continue;

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
