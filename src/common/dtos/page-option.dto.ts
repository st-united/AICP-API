import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../constants';
import { ApiProperty } from '@nestjs/swagger';

export abstract class PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search keyword', default: '' })
  @IsString()
  @ApiProperty({ required: false })
  search?: string = '';

  @ApiPropertyOptional({ enum: Order, description: 'Sort order', default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
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
