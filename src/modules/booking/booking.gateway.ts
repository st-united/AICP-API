import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BookingService } from './booking.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';
import { ExamSlotsReportDto } from './dto/exam-slots-report.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  constructor(public readonly bookingService: BookingService) {}

  @SubscribeMessage('getUserBookings')
  async handleGetUserBookings(@MessageBody() filter: FilterMentorBookingRequestDto) {
    const users = await this.bookingService.findAllWithFilter(filter);
    this.server.emit('userBookings', users);
  }
  async emitNewBooking() {
    const users = await this.bookingService.findAllWithFilter({ page: '1', limit: '10' });
    this.server.emit('userBookingsUpdate', users);
  }

  @SubscribeMessage('join_day')
  async joinDay(@MessageBody() data: { date: string }, @ConnectedSocket() client: Socket) {
    client.join(data.date);
    client.emit('joined_day', { date: data.date });
  }

  @SubscribeMessage('get_available_slots')
  async handleAvailableSlots(@MessageBody() data: { examId: string }, @ConnectedSocket() client: Socket) {
    const available = await this.bookingService.getAvailableSlotsByExamId(data.examId);
    client.emit('available_slots', available);
  }

  async notifySlotUpdate(examId: string) {
    const available = await this.bookingService.getAvailableSlotsByExamId(examId);
    const report = available.data as ExamSlotsReportDto;
    for (const day of report.days) {
      this.server.to(day.date).emit('available_slots', available);
    }
  }
}
