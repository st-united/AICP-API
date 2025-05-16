import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@Constant/types';

/**
 * Service for handling JWT token operations including generation, verification, and management of access tokens,
 * refresh tokens, and activation tokens.
 * @class TokenService
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Generates an access token for a user
   * @param {JwtPayload} payload - The payload to be encoded in the token
   * @returns {string} The generated access token
   * @example
   * const token = generateAccessToken({ sub: '123', email: 'user@example.com' });
   */
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES'),
    });
  }

  /**
   * Generates a refresh token for a user
   * @param {JwtPayload} payload - The payload to be encoded in the token
   * @returns {string} The generated refresh token
   * @example
   * const token = generateRefreshToken({ sub: '123', email: 'user@example.com' });
   */
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRETKEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    });
  }

  /**
   * Decodes a token without verification
   * @param {string} token - The token to decode
   * @returns {JwtPayload} The decoded token payload
   * @example
   * const payload = decodeToken(token);
   */
  decodeToken(token: string): JwtPayload {
    return this.jwtService.decode(token) as JwtPayload;
  }

  /**
   * Generates an activation token for account activation
   * @param {string} userId - The user ID to encode in the token
   * @returns {string} The generated activation token
   * @example
   * const token = generateActivationToken('123');
   */
  generateActivationToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('JWT_ACTIVATE_SECRETKEY'),
        expiresIn: this.configService.get<string>('JWT_ACTIVATE_EXPIRES'),
      }
    );
  }

  /**
   * Verifies if a token is valid
   * @param {string} token - The token to verify
   * @returns {JwtPayload} The decoded token payload
   * @throws {UnauthorizedException} If the token is invalid or expired
   * @example
   * try {
   *   const payload = verifyAccessToken(token);
   * } catch (error) {
   *   // Handle invalid token
   * }
   */
  verifyAccessToken<T extends object = any>(token: string): T {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRETKEY'),
      });
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Verifies if a token is valid
   * @param {string} token - The token to verify
   * @returns {JwtPayload} The decoded token payload
   * @example
   * try {
   *   const payload = verifyRefreshToken(token);
   * } catch (error) {
   *   // Handle invalid token
   * }
   */
  verifyRefreshToken<T extends object = any>(token: string): T {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRETKEY'),
      });
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Verifies an activation token
   * @param {string} token - The activation token to verify
   * @returns {string} The user ID from the token
   * @throws {UnauthorizedException} If the token is invalid or expired
   * @example
   * try {
   *   const userId = verifyActivationToken(token);
   * } catch (error) {
   *   // Handle invalid token
   * }
   */
  verifyActivationToken(token: string): string {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACTIVATE_SECRETKEY'),
      }) as { userId: string };
      return decoded.userId;
    } catch (error) {
      throw new UnauthorizedException('Token kích hoạt không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Checks if a token is expired
   * @param {string} token - The token to check
   * @param {'access' | 'refresh'} type - The type of token to check ('access' or 'refresh')
   * @returns {boolean} True if token is valid and not expired, false otherwise
   * @example
   * const isValid = checkExpiredToken(accessToken, 'access');
   * if (!isValid) {
   *   // Handle expired token
   * }
   */
  checkExpiredToken(token: string, type: 'access' | 'refresh'): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>(type === 'access' ? 'JWT_ACCESS_SECRETKEY' : 'JWT_REFRESH_SECRETKEY'),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
