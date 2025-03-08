import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  imageUrl: string;

  @Expose()
  parentCategoryId: string;

  @Expose()
  deletedAt: Date | null;
}
