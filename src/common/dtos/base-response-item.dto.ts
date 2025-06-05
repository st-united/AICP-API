import { ApiProperty } from '@nestjs/swagger';

export class SimpleResponse<T> {
  @ApiProperty({ description: 'Dữ liệu trả về' })
  readonly data: T;

  @ApiProperty({ example: 'Thành công' })
  readonly message: string;

  constructor(data: T, message: string = 'Thành công') {
    this.data = data;
    this.message = message;
  }
}
