import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  contactName: string;

  @IsEmail()
  contactEmail: string;
}
