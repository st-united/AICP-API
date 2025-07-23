import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  emitBookingUpdated() {
    this.server.emit('bookingUpdated');
  }
}
