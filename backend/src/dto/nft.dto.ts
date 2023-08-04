import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateNftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  asset_id: number;
}

export class FilterNftDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  asset_id: string;
}
