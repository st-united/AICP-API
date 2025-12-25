import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UniversityDto } from '../profile.dto';

export class UpdateStudentInfoDto {
  @IsNotEmpty()
  @IsBoolean()
  isStudent: boolean;

  @IsString()
  @IsOptional()
  university: UniversityDto;

  @IsString()
  @IsOptional()
  studentCode: string;
}
