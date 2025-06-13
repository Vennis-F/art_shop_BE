import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class CategoryFilterResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

@Exclude()
export class ArtworkResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  price: number;

  @Expose()
  shortDescription: string;

  @Expose()
  medium: string;

  @Expose()
  status: string;

  @Expose()
  @Transform(({ value }) => new Date(value).getTime(), { toPlainOnly: true })
  timestamp: Date;

  @Expose()
  imageUrl: string;

  @Expose()
  quantity: number;

  @Expose()
  discount: number;

  @Expose()
  active: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => CategoryFilterResponseDto)
  categories: CategoryFilterResponseDto[];
}
