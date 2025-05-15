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
    const pattern = `${userId}_*`;
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } while (cursor !== '0');
  }

  async deleteOtherSessions(userId: string, ip: string, userAgent: string): Promise<void> {
    const clientInfo = concatTwoStringWithoutSpecialCharacters(ip, userAgent, '_');
    const currentSessionKey = `${userId}_${clientInfo}`;
    const pattern = `${userId}_*`;

    let cursor = '0';
    // delete all sessions except the current one
    do {
      const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;

      const keysToDelete = keys.filter((key) => key !== currentSessionKey);
      if (keysToDelete.length > 0) {
        await this.redisClient.del(...keysToDelete);
      }
    } while (cursor !== '0');
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
