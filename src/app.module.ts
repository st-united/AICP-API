import * as Joi from 'joi';
import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { UsersModule } from '@UsersModule/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { XMLMiddleware } from './common/middleware/xml.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { EmailModule } from './modules/email/email.module';
import { RedisModule } from './modules/redis/redis.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { AnswersModule } from '@AnswersModule/answers.module';
import { ExamSetsModule } from './modules/exam-sets/exam-sets.module';
import { ExamModule } from './modules/exam/exam.module';
import { ZaloOtpModule } from './modules/zalo-otp/zalo-otp.module';
import { DomainModule } from './modules/domain/domain.module';
import { CoursesModule } from './modules/courses/courses.module';
import { BookingModule } from './modules/booking/booking.module';
import { ExportModule } from './modules/export/export.module';
import { ImportsModule } from './modules/imports/imports.module';
import { UniversityModule } from './modules/universities/universities.module';
import { InterviewReminderModule } from './modules/interview-reminder/interview-reminder.module';
import { AspectsModule } from './modules/aspects/aspects.module';
import { MentorSlotsModule } from './modules/mentor-slots/mentor-slots.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_PORT: Joi.number().required(),

        DB_POSTGRES_HOST: Joi.string().required(),
        DB_POSTGRES_PORT: Joi.number().required(),
        DB_POSTGRES_USERNAME: Joi.string().required(),
        DB_POSTGRES_PASSWORD: Joi.string().required(),
        DB_POSTGRES_DATABASE: Joi.string().required(),
        DB_POSTGRES_SYNCHRONIZE: Joi.boolean().required(),
        DB_POSTGRES_LOGGING: Joi.boolean().required(),
        JWT_ACCESS_SECRETKEY: Joi.string().required(),
        JWT_ACCESS_EXPIRES: Joi.string().required(),
        JWT_REFRESH_SECRETKEY: Joi.string().required(),
        JWT_REFRESH_EXPIRES: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_SESSION_EXPIRES_IN: Joi.string().required(),
        REDIS_SCAN_COUNT: Joi.number().required(),
        GOOGLE_CLOUD_KEY_FILE: Joi.string().required(),
        GOOGLE_CLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
        GOOGLE_CLOUD_STORAGE_PUBLIC_URL: Joi.string().required(),
        GOOGLE_CLOUD_STORAGE_CACHE_MAX_AGE: Joi.number().required(),
      }),
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    EmailModule,
    RedisModule,
    MentorsModule,
    AnswersModule,
    ExamSetsModule,
    ExamModule,
    ZaloOtpModule,
    DomainModule,
    CoursesModule,
    BookingModule,
    ExportModule,
    ImportsModule,
    UniversityModule,
    InterviewReminderModule,
    AspectsModule,
    InterviewReminderModule,
    MentorSlotsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XMLMiddleware).forRoutes({
      path: 'report-1/import',
      method: RequestMethod.POST,
    });
  }
}
