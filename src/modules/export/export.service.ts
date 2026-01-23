import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import * as dayjs from 'dayjs';
import { PrismaService } from '../prisma/prisma.service';
import { getUserStatus } from '@app/common/utils/user-status.util';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportStudents(res: Response, fromDate?: string, toDate?: string): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: {
        ...(fromDate && {
          createdAt: { gte: dayjs(fromDate).startOf('day').toDate() },
        }),
        ...(toDate && {
          createdAt: {
            ...(fromDate && {
              gte: dayjs(fromDate).startOf('day').toDate(),
            }),
            lte: dayjs(toDate).endOf('day').toDate(),
          },
        }),
      },
      include: {
        userExam: {
          include: {
            examSet: true,
            InterviewRequest: {
              include: {
                currentSpot: true,
                mentorBookings: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        userPortfolio: true,
        university: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 15 },
      { header: 'Test Name', key: 'testName', width: 20 },
      { header: 'Test Score', key: 'testScore', width: 10 },
      { header: 'Competency Level', key: 'sfiaLevel', width: 15 },
      { header: 'Test Date', key: 'testDate', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Interview Date', key: 'interviewDate', width: 12 },
      { header: 'Interview Slot', key: 'interviewSlot', width: 20 },
      { header: 'Student ID', key: 'studentCode', width: 15 },
      { header: 'University', key: 'university', width: 30 },
      { header: 'LinkedIn', key: 'linkedIn', width: 30 },
      { header: 'GitHub', key: 'github', width: 30 },
      { header: 'Portfolio Files', key: 'portfolioFiles', width: 50 },
      { header: 'Registration Date', key: 'registrationDate', width: 12 },
    ];

    users.forEach((user) => {
      const latestExam = user.userExam[0];
      const interview = latestExam?.InterviewRequest?.[0];
      const spot = interview?.currentSpot;

      worksheet.addRow({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        testName: latestExam?.examSet?.name || '',
        testScore: latestExam?.overallScore || '',
        sfiaLevel: latestExam?.sfiaLevel || '',
        testDate: latestExam?.createdAt ? dayjs(latestExam.createdAt).format('DD/MM/YYYY') : '',
        status: getUserStatus(user.statusTracking, latestExam?.examStatus),

        interviewDate: spot?.startAt ? dayjs(spot.startAt).format('DD/MM/YYYY') : '',

        interviewSlot: spot ? `${dayjs(spot.startAt).format('HH:mm')} - ${dayjs(spot.endAt).format('HH:mm')}` : '',

        studentCode: user.studentCode || '',
        university: user.university?.name || '',
        linkedIn: user.userPortfolio?.linkedInUrl || '',
        github: user.userPortfolio?.githubUrl || '',
        portfolioFiles: user.userPortfolio?.experienceFiles?.join('\n') || '',
        registrationDate: dayjs(user.createdAt).format('DD/MM/YYYY'),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const formatDate = (date?: string) => (date ? dayjs(date).format('DD-MM-YYYY') : '');

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    let dateRange = dayjs().format('DD-MM-YYYY');
    if (from && to) {
      dateRange = from === to ? from : `${from}_${to}`;
    } else if (from || to) {
      dateRange = from || to;
    }

    res.setHeader('Content-Disposition', `attachment; filename=student_test_data_${dateRange}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
