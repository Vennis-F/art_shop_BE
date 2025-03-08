import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ArtworkResponseDto {
  @Expose()
  id: string;

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
}
