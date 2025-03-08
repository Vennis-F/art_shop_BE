import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateArtworkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  width: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  height: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  medium: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  quantity: number;
}
