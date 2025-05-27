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
import { ExamModule } from './modules/exam/exam.module';

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
      }),
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    EmailModule,
    ExamModule,
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
