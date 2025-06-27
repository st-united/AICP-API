import { concatSanitizedStrings } from '@app/common/utils/stringUtils';
import { REDIS_CLIENT } from '@Constant/redis';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SessionDto } from './dto/session.dto';
import { PendingPhone } from '../zalo-otp/interface/zalo-otp.interface';
import { OtpData } from '../zalo-otp/interface/zalo-otp.interface';

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
   * Saves pending phone data to Redis
   * @param phoneData - The phone data to save
   * @throws {Error} If Redis operation fails
   */
  async savePendingPhone(phoneNumber: string): Promise<void> {
    const key = `pending:${phoneNumber}`;
    const data: PendingPhone = {
      phoneNumber,
      submittedAt: Date.now(),
    };

    try {
      await this.redisClient.setex(key, 600, JSON.stringify(data));
      Logger.log(`Saved pending phone: ${phoneNumber}`);
    } catch (error) {
      Logger.error(`Error saving pending phone: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves pending phone data
   * @param phoneNumber - The phone number to check
   * @returns {Promise<PendingPhone | null>} Pending phone data or null if not found
   */
  async getPendingPhone(phoneNumber: string): Promise<PendingPhone | null> {
    const key = `pending:${phoneNumber}`;

    try {
      const data = await this.redisClient.get(key);

      if (!data) return null;

      return JSON.parse(data) as PendingPhone;
    } catch (error) {
      Logger.error(`Error getting pending phone: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Clears pending phone after OTP is created
   * @param phoneNumber - The phone number to clear
   * @throws {Error} If Redis operation fails
   */
  async clearPendingPhone(phoneNumber: string): Promise<void> {
    const key = `pending:${phoneNumber}`;

    try {
      await this.redisClient.del(key);
      Logger.log(`Cleared pending phone: ${phoneNumber}`);
    } catch (error) {
      Logger.error(`Error clearing pending phone: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Saves OTP data (TTL: 5 minutes)
   * @param phoneNumber - The phone number
   * @param otpData - The OTP data to save
   * @throws {Error} If Redis operation fails
   */
  async saveOtp(phoneNumber: string, otpData: OtpData): Promise<void> {
    const key = `otp:${phoneNumber}`;

    try {
      await this.redisClient.setex(key, 300, JSON.stringify(otpData));
      Logger.log(`Saved OTP for phone: ${phoneNumber}`);
    } catch (error) {
      Logger.error(`Error saving OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves OTP data for verification
   * @param phoneNumber - The phone number
   * @returns {Promise<OtpData | null>} OTP data or null if not found
   */
  async getOtp(phoneNumber: string): Promise<OtpData | null> {
    const key = `otp:${phoneNumber}`;

    try {
      const data = await this.redisClient.get(key);

      if (!data) return null;

      return JSON.parse(data) as OtpData;
    } catch (error) {
      Logger.error(`Error getting OTP: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Clears OTP after successful verification
   * @param phoneNumber - The phone number
   * @throws {Error} If Redis operation fails
   */
  async clearOtp(phoneNumber: string): Promise<void> {
    const key = `otp:${phoneNumber}`;

    try {
      await this.redisClient.del(key);
      Logger.log(`Cleared OTP for phone: ${phoneNumber}`);
    } catch (error) {
      Logger.error(`Error clearing OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkSubmitRateLimit(phoneNumber: string): Promise<boolean> {
    const key = `submit_limit:${phoneNumber}`;
    const current = await this.redisClient.incr(key);

    if (current === 1) {
      await this.redisClient.expire(key, 300);
    }

    return current <= 3;
  }

  // Rate limiting cho verify OTP
  async checkVerifyRateLimit(phoneNumber: string): Promise<boolean> {
    const key = `verify_limit:${phoneNumber}`;
    const current = await this.redisClient.incr(key);

    if (current === 1) {
      await this.redisClient.expire(key, 300);
    }

    return current <= 5;
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
