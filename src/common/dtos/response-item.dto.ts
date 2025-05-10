import { plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseItem<T> {
  @ApiProperty({ description: 'Dữ liệu trả về (1 item hoặc danh sách)' })
  readonly data: T | T[];

  @ApiProperty({ example: 'Thành công' })
  readonly message: string;

  constructor(data: T | T[], message = 'Thành công', dtoClass?: new () => T) {
    // Nếu truyền dtoClass, transform về đúng class để áp dụng @Expose()
    if (dtoClass) {
      this.data = Array.isArray(data)
        ? plainToInstance(dtoClass, data, { excludeExtraneousValues: true })
        : plainToInstance(dtoClass, data as T, { excludeExtraneousValues: true });
    } else {
      // Nếu không truyền dtoClass, giữ nguyên
      this.data = data;
    }

    this.message = message;
  }
}
