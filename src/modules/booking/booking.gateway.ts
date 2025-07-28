import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BookingService } from './booking.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly bookingService: BookingService) {}

  async emitUserBookings() {
    const users = await this.bookingService.getAll({});
    this.server.emit('userBookings', users);
  }
}
