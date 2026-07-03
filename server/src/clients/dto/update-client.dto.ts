import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
