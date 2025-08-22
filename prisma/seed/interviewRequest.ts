import { PrismaClient, MentorBookingStatus, TimeSlotBooking } from '@prisma/client';

export async function seedInterviewRequest(
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

  const timeSlots: TimeSlotBooking[] = [
    TimeSlotBooking.AM_08_09,
    TimeSlotBooking.AM_09_10,
    TimeSlotBooking.AM_10_11,
    TimeSlotBooking.AM_11_12,
    TimeSlotBooking.PM_02_03,
    TimeSlotBooking.PM_03_04,
    TimeSlotBooking.PM_04_05,
    TimeSlotBooking.PM_05_06,
  ];

  const interviewDateData = mentorEmails.flatMap((mentorEmail, mentorIndex) =>
    Array.from({ length: 20 }, (_, i) => {
      const menteeIndex = (mentorIndex * 20 + i) % userEmails.length;
      return {
        userEmail: userEmails[menteeIndex],
        mentorEmail,
        scheduledAt: randomFutureDate(),
        timeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
        status: [MentorBookingStatus.UPCOMING, MentorBookingStatus.NOT_JOINED, MentorBookingStatus.COMPLETED][
          Math.floor(Math.random() * 3)
        ],
        notes: `Session between ${userEmails[menteeIndex]} and ${mentorEmail}`,
      };
    })
  );

  const usedExamIds = new Set<string>();

  for (const bookingData of interviewDateData) {
    const userId = userMap[bookingData.userEmail]?.id;
    const examId = examMap[userId]?.id;

    if (!examId) continue;

    const existing = await prisma.interviewRequest.findUnique({
      where: { examId },
    });

    if (!existing) {
      await prisma.interviewRequest.create({
        data: {
          examId,
          interviewDate: bookingData.scheduledAt,
          timeSlot: bookingData.timeSlot,
        },
      });
    }
  }
}
