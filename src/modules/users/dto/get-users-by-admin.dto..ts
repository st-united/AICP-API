import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '@app/common/dtos';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByAdminDto extends PageOptionsDto {
  @Expose()
  @ApiProperty()
  @IsOptional()
  fullName: string;

  @Expose()
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => {
    if (value === '0') return false;
    if (value === '1') return true;
    return undefined;
  })
  status: boolean;

  @Expose()
  @ApiProperty()
  @IsOptional()
  province: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  job: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  startDate: Date;

  @Expose()
  @ApiProperty()
  @IsOptional()
  endDate: Date;

  @Expose()
  @ApiProperty()
  @IsOptional()
  createdAt: Date;
}
