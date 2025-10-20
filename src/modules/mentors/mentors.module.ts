import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { UsersModule } from '@UsersModule/users.module';
import { EmailModule } from '../email/email.module';
import { TokenService } from '../auth/services/token.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { BookingModule } from '../booking/booking.module';
import { ExamServiceCommon } from '@app/common/services/exam.service';
@Module({
  imports: [
    PassportModule,
    UsersModule,
    EmailModule,
    RedisModule,
    ConfigModule,
    BookingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRETKEY'),
        signOptions: { expiresIn: `${configService.get<number>('JWT_ACCESS_EXPIRES')}` },
      }),
    }),
    UsersModule,
  ],
  controllers: [MentorsController],
  providers: [MentorsService, TokenService, EmailService, ConfigService, ExamServiceCommon],
})
export class MentorsModule {}
