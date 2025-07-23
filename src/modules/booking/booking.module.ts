import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingGateway } from './booking.gateway';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService, BookingGateway],
  exports: [BookingGateway],
})
export class BookingModule {}
