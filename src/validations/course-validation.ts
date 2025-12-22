import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { validateFileExtension } from './file-validation';

export const THUMB_IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'] as const;

export const VALIDATION_THUMB_IMAGE = FileInterceptor('thumbnailImage', {
  fileFilter: (req, file, callback) => {
    try {
      validateFileExtension(file, THUMB_IMAGE_ALLOWED_EXTENSIONS);
      callback(null, true);
    } catch (err) {
      callback(err, false);
    }
  },
});
