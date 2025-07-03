import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Storage, StorageOptions } from '@google-cloud/storage';
import * as fs from 'fs';
import { GOOGLE_CLOUD_STORAGE } from '@Constant/google-cloud';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
/**
 * Service for handling file operations with Google Cloud Storage.
 * Provides functionality for uploading, deleting files and managing file URLs.
 */
@Injectable()
export class GoogleCloudStorageService {
  private readonly storage: Storage;
  private readonly bucketName = this.configService.get<string>('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
  private readonly googlePublicUrl = this.configService.get<string>('GOOGLE_CLOUD_STORAGE_PUBLIC_URL');
  private readonly googleCacheMaxAge = this.configService.get<number>('GOOGLE_CLOUD_STORAGE_CACHE_MAX_AGE');

  /**
   * Creates an instance of GoogleCloudStorageService.
   * @param options - Google Cloud Storage configuration options
   * @param configService - NestJS ConfigService for accessing environment variables
   */
  constructor(
    @Inject(GOOGLE_CLOUD_STORAGE) private readonly options: StorageOptions,
    private readonly configService: ConfigService
  ) {
    this.storage = new Storage(this.options);
  }

  /**
   * Uploads a file to Google Cloud Storage.
   * @param file - The file to upload (Express.Multer.File)
   * @param destFileName - Optional custom destination filename. If not provided, uses original filename
   * @returns Promise<string> - The public URL of the uploaded file
   * @throws {BadRequestException} When file upload fails
   */
  async uploadFile(file: Express.Multer.File, destFileName?: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const destination = destFileName || file.originalname;

      const blob = bucket.file(destination);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
        metadata: {
          cacheControl: `public, max-age=${this.googleCacheMaxAge}`,
        },
      });

      return await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));

        blobStream.on('finish', async () => {
          const publicUrl = `${this.googlePublicUrl}/${this.bucketName}/${destination}`;
          resolve(publicUrl);
        });

        if (file.buffer) {
          blobStream.end(file.buffer);
        } else {
          const fileStream = fs.createReadStream(file.path);
          fileStream.pipe(blobStream);
        }
      });
    } catch (error) {
      Logger.error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Lỗi khi upload ảnh');
    }
  }

  /**
   * Extracts the destination filename from a public URL.
   * @param publicUrl - The public URL of the file
   * @returns string - The destination filename
   */
  getFileDestFromPublicUrl(publicUrl: string): string {
    const prefix = `${this.googlePublicUrl}/${this.bucketName}/`;
    if (!publicUrl.startsWith(prefix)) {
      Logger.log(`Invalid public URL: ${publicUrl}`);
    }
    return publicUrl.slice(prefix.length);
  }

  /**
   * Deletes a file from Google Cloud Storage.
   * @param destFileName - The destination filename to delete
   * @returns Promise<void>
   */
  async deleteFile(destFileName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(destFileName).delete();
    } catch (err) {
      Logger.error(`Failed to delete file ${destFileName}: ${err instanceof Error ? err.message : err}`);
    }
  }

  /**
   * Uploads a buffer (e.g. resized image) to Google Cloud Storage.
   * @param buffer - The buffer to upload (e.g. from sharp)
   * @param destFileName - Destination filename on GCS
   * @param contentType - MIME type (e.g. 'image/jpeg')
   * @returns Promise<string> - The public URL of the uploaded file
   */
  async uploadBuffer(buffer: Buffer, destFileName: string, contentType: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(destFileName);

      await blob.save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          cacheControl: `public, max-age=${this.googleCacheMaxAge}`,
        },
        //public: true,
      });

      return `${this.googlePublicUrl}/${this.bucketName}/${destFileName}`;
    } catch (error) {
      Logger.error(`Failed to upload buffer: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException('Lỗi khi upload ảnh từ buffer');
    }
  }
}
