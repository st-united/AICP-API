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
   * @param deviceId - The ID of the device
   * @param ip - The IP address of the device
   * @throws {Error} If Redis operation fails
   */
  async saveSessionToRedis(userId: string, deviceId: string, ip: string) {
    try {
      const clientInfo = concatSanitizedStrings(ip, deviceId, '_');
      const sessionKey = `${userId}_${clientInfo}`;

      await this.setOnlineSession(userId, sessionKey);
      await this.redisClient.expire(sessionKey, this.configService.get<number>('REDIS_SESSION_EXPIRES_IN'));
    } catch (error) {
      Logger.error(`Error saving session to Redis: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Checks if a session exists in Redis
   * @param userId - The ID of the user
   * @param clientInfo - The client information (IP and device ID)
   * @returns {Promise<boolean>} True if session exists, false otherwise
   */
  async isSessionExist(userId: string, clientInfo: string): Promise<boolean> {
    try {
      const sessionKey = `${userId}_${clientInfo}`;
      const exists = await this.redisClient.exists(sessionKey);
      return !!exists;
    } catch (error) {
      Logger.error(`Error checking session existence: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Deletes a specific session from Redis
   * @param userId - The ID of the user
   * @param clientInfo - The client information (IP and device ID)
   * @throws {Error} If Redis operation fails
   */
  async deleteSession(userId: string, clientInfo: string): Promise<void> {
    try {
      const sessionKey = `${userId}_${clientInfo}`;
      await this.redisClient.del(sessionKey);
    } catch (error) {
      Logger.error(`Error deleting session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Scans Redis for keys matching a pattern
   * @param pattern - The pattern to match keys against
   * @returns {Promise<string[]>} Array of matching keys
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [newCursor, foundKeys] = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        this.configService.get<number>('REDIS_SCAN_COUNT')
      );
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    return keys;
  }

  /**
   * Updates multiple sessions with a given status
   * @param keys - Array of session keys to update
   * @param status - The status to set ('online' or 'offline')
   */
  private async updateMultipleSessions(keys: string[], status: 'online' | 'offline'): Promise<void> {
    if (keys.length > 0) {
      const updatePromises = keys.map((key) => this.setValue(key, status));
      await Promise.all(updatePromises);
    }
  }

  /**
   * Gets all session keys containing a specific user ID
   * @param userId - The ID of the user
   * @returns {Promise<string[]>} Array of session keys
   */
  async getAllSessionKeysContainingUserId(userId: string): Promise<string[]> {
    return this.scanKeys(`*${userId}*`);
  }

  /**
   * Deletes all sessions for a specific user
   * @param userId - The ID of the user
   * @throws {Error} If Redis operation fails
   */
  async deleteAllSessions(userId: string): Promise<void> {
    try {
      const keys = await this.scanKeys(`${userId}_*`);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      Logger.error(`Error deleting all sessions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes all sessions except the current one for a user
   * @param userId - The ID of the user
   * @param currentSessionKey - The key of the current session to keep
   * @throws {Error} If Redis operation fails
   */
  async deleteOtherSessions(userId: string, currentSessionKey: string): Promise<void> {
    try {
      const keys = await this.scanKeys(`${userId}_*`);
      const keysToDelete = keys.filter((key) => key !== currentSessionKey);
      if (keysToDelete.length > 0) {
        await this.redisClient.del(...keysToDelete);
      }
    } catch (error) {
      Logger.error(`Error deleting other sessions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sets a session as online and all other sessions as offline
   * @param userId - The ID of the user
   * @param sessionKey - The key of the session to set as online
   * @throws {Error} If Redis operation fails
   */
  async setOnlineSession(userId: string, sessionKey: string): Promise<void> {
    try {
      await this.setValue(sessionKey, 'online');
      const otherSessions = (await this.scanKeys(`${userId}_*`)).filter((key) => key !== sessionKey);
      await this.updateMultipleSessions(otherSessions, 'offline');
    } catch (error) {
      Logger.error(`Error setting online session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sets a session as offline
   * @param sessionKey - The key of the session to set as offline
   * @throws {Error} If Redis operation fails
   */
  async setOfflineSession(sessionKey: string): Promise<void> {
    try {
      await this.setValue(sessionKey, 'offline');
    } catch (error) {
      Logger.error(`Error setting offline session: ${error.message}`, error.stack);
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
      const allSessions = await this.scanKeys('*_*_*');
      await this.updateMultipleSessions(allSessions, 'offline');
      await this.redisClient.quit();
    } catch (error) {
      Logger.error('Error during Redis shutdown:', error);
      this.redisClient.disconnect();
    }
  }
}
