import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZaloOtpController } from './zalo-otp.controller';
import { ZaloOtpService } from './zalo-otp.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [HttpModule, ConfigModule, RedisModule],
  controllers: [ZaloOtpController],
  providers: [ZaloOtpService],
  exports: [ZaloOtpService],
})
export class ZaloOtpModule {}
