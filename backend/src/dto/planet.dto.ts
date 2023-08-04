import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  Min,
  IsDefined,
  ValidateNested,
  IsUrl,
  IsOptional,
  MaxLength,
} from 'class-validator';

class Denomination {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsDefined()
  experience: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsDefined()
  dust: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsDefined()
  fuel: number;
}

export class PlanetDto {
  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  @IsString()
  @IsDefined()
  @MaxLength(26)
  name: string;

  @IsString()
  @IsDefined()
  @MaxLength(512)
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsDefined()
  distanceOfPlanet: number;

  @ValidateNested()
  @Type(() => Denomination)
  denomination: Denomination;
}
