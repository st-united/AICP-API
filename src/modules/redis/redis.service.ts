import { concatTwoStringWithoutSpecialCharacters } from '@app/common/utils/stringUtils';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}
  async saveSessionToRedis(userId: string, deviceId: string, ip: string, userAgent: string) {
    const clientInfo = concatTwoStringWithoutSpecialCharacters(ip, userAgent, '_');
    const sessionKey = `${userId}_${clientInfo}`;

    await this.setValue(sessionKey, {
      deviceId,
      ip,
      userAgent,
      createdAt: new Date().toISOString(),
    });

    await this.redisClient.expire(sessionKey, process.env.REDIS_SESSION_EXPIRES_IN);
  }

  async isSessionExist(userId: string, ip: string, userAgent: string): Promise<boolean> {
    const clientInfo = concatTwoStringWithoutSpecialCharacters(ip, userAgent, '_');
    const sessionKey = `${userId}_${clientInfo}`;

    const exists = await this.redisClient.exists(sessionKey);
    return exists === 1;
  }

  async deleteSession(userId: string, ip: string, userAgent: string): Promise<void> {
    const clientInfo = concatTwoStringWithoutSpecialCharacters(ip, userAgent, '_');
    const sessionKey = `${userId}_${clientInfo}`;
    await this.redisClient.del(sessionKey);
  }

  async deleteAllSessions(userId: string) {
    const sessionKey = `${userId}_*`;
    await this.redisClient.del(sessionKey);
  }

  async deleteOtherSessions(userId: string, ip: string, userAgent: string): Promise<void> {
    const clientInfo = concatTwoStringWithoutSpecialCharacters(ip, userAgent, '_');
    const currentSessionKey = `${userId}_${clientInfo}`;

    // Get all keys matching the userId pattern
    const allKeys = await this.redisClient.keys(`${userId}_*`);

    // Delete all sessions except the current one
    const deletePromises = allKeys.filter((key) => key !== currentSessionKey).map((key) => this.redisClient.del(key));

    await Promise.all(deletePromises);
  }

  async getValue(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async setValue(key: string, value: Record<string, any>) {
    if (Buffer.isBuffer(value)) {
      throw new Error('Cannot store a Buffer in Redis.');
    }
    await this.redisClient.hmset(key, value);
  }

  async deleteValue(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
