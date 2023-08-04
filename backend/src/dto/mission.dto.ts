import {
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class OptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  positiveOutcome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  negativeOutcome: string;
}

export class MissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(52)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  description: string;

  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  options: OptionDto[];
}
