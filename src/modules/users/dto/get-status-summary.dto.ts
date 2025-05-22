import { Expose } from 'class-transformer';

export class GetStatusSummaryDto {
  @Expose()
  users: number;

  @Expose()
  activates: number;

  @Expose()
  unactivates: number;
}
