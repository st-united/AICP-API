import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImportUsersExamsDto } from './common/dtos/import-users-exams.dto';
import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly service: ImportsService) {}

  @Post('users-exams')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const isExcel =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.originalname.toLowerCase().endsWith('.xlsx');
        cb(isExcel ? null : new BadRequestException('File phải là .xlsx'), isExcel);
      },
    })
  )
  async importUsersWithExams(@UploadedFile() file: Express.Multer.File, @Body() dto: ImportUsersExamsDto) {
    if (!file?.buffer?.length) throw new BadRequestException('Thiếu file .xlsx');
    return this.service.importUsersWithExamsFromExcel(file.buffer, dto);
  }
}
