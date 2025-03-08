import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  imageUrl: string;

  @IsOptional()
  @IsString()
  parentCategoryId?: string;
}
