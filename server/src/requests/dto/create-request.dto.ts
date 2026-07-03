import { Priority, RequestStatus, RequestType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsEnum(RequestType)
  requestType: RequestType;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
