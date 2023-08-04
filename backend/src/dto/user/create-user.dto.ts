import regx from '@shared/utils/regx';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDefined,
  IsNumberString,
  IsEmail,
} from 'class-validator';
import { IsRegxMatch } from 'src/utils/custom-validators';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @IsRegxMatch(new RegExp(regx.name), {
    message: 'Please provide a valid name',
  })
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @IsDefined()
  @IsString()
  @IsEmail()
  @MinLength(4)
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}
