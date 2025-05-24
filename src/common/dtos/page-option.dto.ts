import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { Order } from '../constants';
import { ApiProperty } from '@nestjs/swagger';

export abstract class PageOptionsDto {
  @IsString()
  @ApiProperty({ required: false })
  search?: string = '';

  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  orderBy?: string = 'createdAt';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
