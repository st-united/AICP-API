import { PrismaClient, MentorBookingStatus } from '@prisma/client';

export async function seedMentorBookings(
  prisma: PrismaClient,
  userMap: { [email: string]: { id: string } },
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

  const mentorBookingsData = [];
  mentorEmails.forEach((mentorEmail, mentorIndex) => {
    for (let i = 0; i < 20; i++) {
      const menteeIndex = (mentorIndex * 20 + i) % userEmails.length;
      mentorBookingsData.push({
        userEmail: userEmails[menteeIndex],
        mentorEmail,
        scheduledAt: randomFutureDate(),
        timeSlot: ['AM_08_09', 'AM_09_10', 'AM_10_11', 'AM_11_12', 'PM_02_03', 'PM_03_04', 'PM_04_05', 'PM_05_06'][
          Math.floor(Math.random() * 8)
        ],
        status: [
          MentorBookingStatus.ACCEPTED,
          MentorBookingStatus.PENDING,
          MentorBookingStatus.REJECTED,
          MentorBookingStatus.COMPLETED,
          MentorBookingStatus.CANCELLED,
        ][Math.floor(Math.random() * 5)],
        notes: `Session between ${userEmails[menteeIndex]} and ${mentorEmail}`,
      });
    }
  });

  const mentorEmailMap = Object.fromEntries(mentors.map((mentor) => [mentor.user.email, mentor]));

  for (const bookingData of mentorBookingsData) {
    await prisma.mentorBooking.create({
      data: {
        userId: userMap[bookingData.userEmail].id,
        mentorId: mentorEmailMap[bookingData.mentorEmail].id,
        scheduledAt: bookingData.scheduledAt,
        status: bookingData.status,
        notes: bookingData.notes,
      },
    });
  }
}
