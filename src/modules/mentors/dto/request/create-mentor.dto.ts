import { RegisterUserDto } from '@app/modules/auth/dto/register-user.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { UserRoleEnum } from '@Constant/enums';

export class CreateMentorDto extends OmitType(RegisterUserDto, ['password', 'role']) {
  @IsEnum(UserRoleEnum)
  @Transform(({ value }) => value ?? UserRoleEnum.MENTOR)
  role: string = UserRoleEnum.MENTOR;

  @Expose()
  @ApiProperty({
    description: 'The expertise of the mentor',
    type: String,
    required: false,
    example: 'JavaScript, React, Node.js',
  })
  @IsOptional()
  @IsString()
  expertise?: string;

  @Expose()
  @ApiProperty({
    description: 'The date of birth of the mentor',
    type: Date,
    required: false,
    example: new Date(),
  })
  @IsOptional()
  dob?: Date;
}
