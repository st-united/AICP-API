import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
export const FILE_LIMITS = {
  fileSize: 5 * 1024 * 1024,
};

export const validateFileExtension = (file: Express.Multer.File) => {
  const fileExt = file.originalname.split('.').pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new BadRequestException(
      `File extension ${fileExt} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }
  return true;
};

export const validateFileSize = (file: Express.Multer.File) => {
  if (file.size > FILE_LIMITS.fileSize) {
    throw new BadRequestException(`File size exceeds limit of ${FILE_LIMITS.fileSize / 1024 / 1024}MB`);
  }
  return true;
};

export const PORTFOLIO_FILE_INTERCEPTOR = FileInterceptor('file', {
  limits: {
    fileSize: FILE_LIMITS.fileSize,
  },
  fileFilter: (req, file: Express.Multer.File, callback) => {
    try {
      validateFileExtension(file);
      validateFileSize(file);
      callback(null, true);
    } catch (error) {
      callback(error, false);
    }
  },
});
