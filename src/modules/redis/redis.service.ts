import { concatSanitizedStrings } from '@app/common/utils/stringUtils';
import { REDIS_CLIENT } from '@Constant/redis';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

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
   * @param userId - The ID of the user
   * @param userAgent - The user agent of the device
   * @param ip - The IP address of the device
   * @throws {Error} If Redis operation fails
   */
  async saveSessionToRedis(userId: string, userAgent: string, ip: string) {
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
   * @param userId - The ID of the user
   * @returns {Promise<boolean>} True if session exists, false otherwise
   */
  async isSessionExist(userId: string, ip: string, userAgent: string): Promise<boolean> {
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
   * @throws {Error} If Redis operation fails
   */
  async setValue(key: string, value: string) {
    try {
      await this.redisClient.set(key, value);
    } catch (error) {
      Logger.error(`Error setting value: ${error.message}`, error.stack);
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
