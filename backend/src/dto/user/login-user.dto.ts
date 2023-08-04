import { IsDefined, IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}

export class VerifyLogginDto {
  @IsDefined()
  @IsString()
  token: string;
}
