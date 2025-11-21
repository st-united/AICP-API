import { BadRequestException } from '@nestjs/common';

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidFileExtension = (filename: string, ALLOWED_EXTENSIONS: readonly string[]): boolean => {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext as any);
};

export const validateFileExtension = (file: any, ALLOWED_EXTENSIONS: readonly string[]): boolean => {
  if (!isValidFileExtension(file.originalname, ALLOWED_EXTENSIONS)) {
    throw new BadRequestException(
      `Định dạng file ${getFileExtension(file.originalname)} không được hỗ trợ. Định dạng được phép: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }
  return true;
};
