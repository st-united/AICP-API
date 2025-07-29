import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BookingService } from './booking.service';
import { FilterMentorBookingRequestDto } from './dto/filter-mentor-booking-request.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bookingService: BookingService) {}

  @SubscribeMessage('getUserBookings')
  async handleGetUserBookings(@MessageBody() filter: FilterMentorBookingRequestDto) {
    const users = await this.bookingService.findAllWithFilter(filter);
    this.server.emit('userBookings', users);
  }
  async emitNewBooking() {
    const users = await this.bookingService.findAllWithFilter({ page: '1', limit: '10' });
    this.server.emit('userBookingsUpdate', users);
  }
}
