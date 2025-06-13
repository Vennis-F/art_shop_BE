import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
import { Transform, Type } from 'class-transformer';

export class FilterArtworkDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  mediums?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  dimensions?: string[]; // Format: '30x30', '40x60'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  categoryIds?: string[];

  @IsOptional()
  @Type(() => Number)
  priceFrom?: number;

  @IsOptional()
  @Type(() => Number)
  priceTo?: number;
}
