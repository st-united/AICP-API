import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class University {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  code: string;
}
