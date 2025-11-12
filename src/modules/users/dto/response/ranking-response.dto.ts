import { ApiProperty } from '@nestjs/swagger';
import { RankingUserDto, CurrentUserRankingDto } from '../ranking-user.dto';

export class RankingResponseDto {
  @ApiProperty({ description: 'Tổng số lượng user trong hệ thống', example: 12345 })
  totalUsers: number;

  @ApiProperty({
    description: 'Danh sách top 100 user có điểm cao nhất',
    type: [RankingUserDto],
  })
  topRanking: RankingUserDto[];

  @ApiProperty({
    description: 'Thông tin của user hiện tại',
    type: CurrentUserRankingDto,
    nullable: true,
  })
  currentUser: CurrentUserRankingDto | null;
}
