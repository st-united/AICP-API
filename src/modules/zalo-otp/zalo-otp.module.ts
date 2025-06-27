import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZaloOtpController } from './zalo-otp.controller';
import { ZaloOtpService } from './zalo-otp.service';
import { ZaloModule } from '../zalo/zalo.module';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [HttpModule, ConfigModule, ZaloModule, RedisModule],
  controllers: [ZaloOtpController],
  providers: [ZaloOtpService, RedisService],
  exports: [ZaloOtpService],
})
export class ZaloOtpModule {}
