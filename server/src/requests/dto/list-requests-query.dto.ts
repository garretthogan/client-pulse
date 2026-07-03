import { Priority, RequestStatus } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class ListRequestsQueryDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['updatedAt_desc', 'updatedAt_asc'])
  sort?: 'updatedAt_desc' | 'updatedAt_asc';
}
