import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStudentInfoDto {
  @IsNotEmpty()
  @IsBoolean()
  isStudent: boolean;

  @IsString()
  @IsOptional()
  university: string;

  @IsString()
  @IsOptional()
  studentCode: string;
}
