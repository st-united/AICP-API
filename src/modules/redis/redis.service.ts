import { concatSanitizedStrings } from '@app/common/utils/stringUtils';
import { REDIS_CLIENT } from '@Constant/redis';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SessionDto } from './dto/session.dto';

/**
 * Service for managing Redis operations related to user sessions
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService
  ) {}

  /**
   * Saves a new session to Redis and sets it as online
   * @param sessionDto - The session data
   * @throws {Error} If Redis operation fails
   */
  async saveSessionToRedis(sessionDto: SessionDto) {
    const { userId, userAgent, ip } = sessionDto;
    try {
      const clientInfo = concatSanitizedStrings(ip, userAgent, '_');
      await this.redisClient.set(userId, clientInfo);
      await this.redisClient.expire(userId, this.configService.get<number>('REDIS_SESSION_EXPIRES_IN'));
    } catch (error) {
      Logger.error(`Error saving session to Redis: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Checks if a session exists in Redis
   * @param sessionDto - The session data
   * @returns {Promise<boolean>} True if session exists, false otherwise
   */
  async isSessionExist(sessionDto: SessionDto): Promise<boolean> {
    const { userId, ip, userAgent } = sessionDto;
    try {
      const clientInfo = concatSanitizedStrings(ip, userAgent, '_');
      const session = await this.redisClient.get(userId);

      return session === clientInfo;
    } catch (error) {
      Logger.error(`Error checking session existence: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Deletes a specific session from Redis
   * @param userId - The ID of the user
   * @throws {Error} If Redis operation fails
   */
  async deleteSession(userId: string): Promise<void> {
    try {
      await this.redisClient.del(userId);
    } catch (error) {
      Logger.error(`Error deleting session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets a value from Redis by key
   * @param key - The key to get the value for
   * @returns {Promise<string>} The value stored at the key
   * @throws {Error} If Redis operation fails
   */
  async getValue(key: string): Promise<string> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      Logger.error(`Error getting value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sets a value in Redis for a given key
   * @param key - The key to set the value for
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   * @throws {Error} If Redis operation fails
   */
  async setValue(key: string, value: string, ttl?: number) {
    try {
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      Logger.error(`Error setting value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sets a permanent value in Redis (no expiration)
   * @param key - The key to set the value for
   * @param value - The value to store
   * @throws {Error} If Redis operation fails
   */
  async setPermanentValue(key: string, value: string) {
    try {
      await this.redisClient.set(key, value);
    } catch (error) {
      Logger.error(`Error setting permanent value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Atomic check-and-set operation to prevent race conditions
   * @param key - The key to check and set
   * @param value - The value to set if key doesn't exist
   * @returns {Promise<boolean>} True if the value was set, false if it already existed
   * @throws {Error} If Redis operation fails
   */
  async setIfNotExists(key: string, value: string): Promise<boolean> {
    try {
      const result = await this.redisClient.set(key, value, 'NX');
      return result === 'OK';
    } catch (error) {
      Logger.error(`Error in setIfNotExists: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a value from Redis by key
   * @param key - The key to delete
   * @returns {Promise<number>} The number of keys deleted
   * @throws {Error} If Redis operation fails
   */
  async deleteValue(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      Logger.error(`Error deleting value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handles cleanup when the module is destroyed
   * Sets all sessions to offline and closes Redis connection
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.redisClient.quit();
    } catch (error) {
      Logger.error('Error during Redis shutdown:', error);
      this.redisClient.disconnect();
    }
  }
}
