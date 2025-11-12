import { ApiProperty, PickType } from '@nestjs/swagger';
import { ProfileDto } from '@app/modules/users/dto/profile.dto';

export class RankingUserDto extends PickType(ProfileDto, ['id', 'fullName', 'avatarUrl'] as const) {
  @ApiProperty({ description: 'Thứ hạng của user trong bảng xếp hạng', example: 1 })
  rank: number;

  @ApiProperty({ description: 'Điểm số của user', example: 1200 })
  score: number;
}

export class CurrentUserRankingDto {
  @ApiProperty({ description: 'ID của user hiện tại' })
  userId: string;

  @ApiProperty({ description: 'Vị trí xếp hạng của user', example: 42, nullable: true })
  rank: number | null;

  @ApiProperty({ description: 'Điểm số hiện tại của user', example: 850, nullable: true })
  score: number | null;
}
