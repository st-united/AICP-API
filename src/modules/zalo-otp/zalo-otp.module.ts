import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ZaloOtpController } from './zalo-otp.controller';
import { ZaloOtpService } from './zalo-otp.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RedisModule,
    MulterModule.register({
      dest: './public',
    }),
  ],
  controllers: [ZaloOtpController],
  providers: [ZaloOtpService, ConfigService],
  exports: [ZaloOtpService],
})
export class ZaloOtpModule {}
