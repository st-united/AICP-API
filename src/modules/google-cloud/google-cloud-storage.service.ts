import { Inject, Injectable } from '@nestjs/common';
import { Storage, StorageOptions } from '@google-cloud/storage';
import * as fs from 'fs';
import { GOOGLE_CLOUD_STORAGE } from '@Constant/google-cloud';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCloudStorageService {
  private storage: Storage;
  private bucketName = this.configService.get<string>('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
  private googlePublicUrl = this.configService.get<string>('GOOGLE_CLOUD_STORAGE_PUBLIC_URL');
  private googleCacheMaxAge = this.configService.get<number>('GOOGLE_CLOUD_STORAGE_CACHE_MAX_AGE');

  constructor(
    @Inject(GOOGLE_CLOUD_STORAGE) private readonly options: StorageOptions,
    private readonly configService: ConfigService
  ) {
    this.storage = new Storage(this.options);
  }

  async uploadFile(file: Express.Multer.File, destFileName?: string): Promise<string> {
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

    return new Promise((resolve, reject) => {
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
  }
}
