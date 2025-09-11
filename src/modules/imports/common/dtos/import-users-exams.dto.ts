import { IsUUID, IsOptional, IsString, IsIn } from 'class-validator';
export class ImportUsersExamsDto {
  @IsUUID() examSetId!: string;
  @IsOptional() @IsString() sheetName?: string;
  @IsOptional() @IsIn(['auto', 'none']) scoring?: 'auto' | 'none';
}
