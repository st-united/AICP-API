import { Module } from '@nestjs/common';
import { GoogleCloudStorageService } from './google-cloud-storage.service';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_CLOUD_STORAGE } from '@Constant/google-cloud';
@Module({
  providers: [
    {
      provide: GOOGLE_CLOUD_STORAGE,
      useFactory: (configService: ConfigService) => ({
        keyFilename: configService.get('GOOGLE_CLOUD_KEY_FILE'),
        projectId: configService.get('GOOGLE_CLOUD_PROJECT_ID'),
      }),

      inject: [ConfigService],
    },
    GoogleCloudStorageService,
    ConfigService,
  ],
  controllers: [],
  exports: [GoogleCloudStorageService],
})
export class GoogleCloudModule {}
