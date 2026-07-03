import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(2)
  authorName: string;

  @IsString()
  @MinLength(2)
  body: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
