import { IsOptional } from 'class-validator';

import { PageOptionsDto } from '@app/common/dtos';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByAdminDto extends PageOptionsDto {
  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  fullName: string;

  @Expose()
  @IsOptional()
  @ApiProperty({ required: false })
  @Transform(({ value }) => {
    if (value === '0' || value === 'false') return false;
    if (value === '1' || value === 'true') return true;
    return undefined;
  })
  status: boolean;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  province: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  job: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  startDate: Date;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  endDate: Date;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  createdAt: Date;
}
