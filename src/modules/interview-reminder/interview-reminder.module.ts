import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InterviewReminderController } from './interview-reminder.controller';
import { InterviewReminderScheduler } from './interview-reminder.scheduler';
import { InterviewReminderService } from './interview-reminder.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [InterviewReminderController],
  providers: [InterviewReminderService, InterviewReminderScheduler],
  exports: [InterviewReminderService],
})
export class InterviewReminderModule {}
