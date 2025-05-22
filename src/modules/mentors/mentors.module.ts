import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { UsersModule } from '@UsersModule/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [MentorsController],
  providers: [MentorsService],
})
export class MentorsModule {}
