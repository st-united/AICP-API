import { Module, Global, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from '@app/common/constants';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisInstance = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });

        redisInstance.on('error', (e) => {
          Logger.error(`Redis connection failed: ${e}`);
        });

        return redisInstance;
      },
      inject: [ConfigService],
    },
    RedisService,
    ConfigService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown() {
    const redisClient = this.moduleRef.get<Redis>(REDIS_CLIENT);
    await redisClient.quit();
  }
}
