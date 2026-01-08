import { Module } from '@nestjs/common';
import { EmailModule } from '@app/modules/email/email.module';
import { PrismaModule } from '@app/modules/prisma/prisma.module';
import { InterviewReminderScheduler } from '@app/modules/interview-reminder/interview-reminder.scheduler';
import { InterviewReminderService } from '@app/modules/interview-reminder/interview-reminder.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [],
  providers: [InterviewReminderService, InterviewReminderScheduler],
  exports: [InterviewReminderService],
})
export class InterviewReminderModule {}
