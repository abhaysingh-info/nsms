import regx from '@shared/utils/regx';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsRegxMatch } from 'src/utils/custom-validators';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // write fields for update user from CreateUserDto include fields like name, and email but make it optional by using PartialType.
  @IsOptional()
  @IsString()
  @IsRegxMatch(new RegExp(regx.name), {
    message: 'Please provide a valid name',
  })
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MinLength(4)
  email: string;
}
