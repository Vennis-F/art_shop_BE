import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CategoryResponseTestDto {
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

  @Expose()
  @Type(() => CategoryResponseTestDto)
  children: CategoryResponseTestDto[];

  @Expose()
  get isRoot(): boolean {
    return this.parentCategoryId === null;
  }
}
