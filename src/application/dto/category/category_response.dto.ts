export class CategoryResponseDto {
  id: string;

  name: string;

  imageUrl: string;

  parentCategoryId: string;

  deletedAt: Date | null;
}
