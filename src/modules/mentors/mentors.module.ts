import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { UsersModule } from '@UsersModule/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MentorsController],
  providers: [MentorsService],
})
export class MentorsModule {}
