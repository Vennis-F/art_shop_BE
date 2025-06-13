import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtworkDto } from 'src/application/dto/artwork/create_artwork.dto';
import { ArtworkRepository } from 'src/infrastructure/repository/artwork.respository';
import { User } from '../entity/user.entity';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../infrastructure/aws/s3/s3.service';
import { AddImageResponseDto } from 'src/application/dto/artwork/add_image_response.dto';
import { Artwork } from '../entity/artwork.entity';
import { CategoryRepository } from 'src/infrastructure/repository/category.repository';
import { Category } from '../entity/category.entity';
import { FilterArtworkDto } from 'src/application/dto/artwork/filter_artwork.dto';
import { UpdateArtworkDto } from 'src/application/dto/artwork/update_artwork.dto';

@Injectable()
export class ArtworkService {
  private logger = new Logger(ArtworkService.name, { timestamp: true });

  constructor(
    private readonly artworkResposioty: ArtworkRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async createArtwork(body: CreateArtworkDto, user: User): Promise<Artwork> {
    await this.isTitleExist(body.title);

    const categories = await this.getCategoriesValid(body.categoryIds);
    const artwork = await this.artworkResposioty.createArtwork({
      ...body,
      categories: categories,
      active: false,
      user,
    });

    this.logger.log(
      `method=createArtwork, Artwork with ID: ${artwork.id} has been created.`,
    );

    return artwork;
  }

  async uploadImage(file: Express.Multer.File): Promise<AddImageResponseDto> {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const timestamp = Date.now();
    const key = `images/artwork/${timestamp}_${file.originalname}`;
    const url = await this.s3Service.uploadFile(
      bucketName,
      key,
      file.buffer,
      file.mimetype,
    );

    return { url, key };
  }

  async isTitleExist(title: string) {
    if (await this.artworkResposioty.findByTitle(title)) {
      this.logger.error(
        `method=isTitleExist, Title '${title}' already exists.`,
      );
      throw new ConflictException(
        `Title '${title}' already exists. Please use a different title.`,
      );
    }
  }

  async fetchArtworks(filter: FilterArtworkDto) {
    const { items, total } =
      await this.artworkResposioty.filterArtworks(filter);

    const mapped = items.map((artwork) => ({
      ...artwork,
      imageUrl: this.s3Service.getFileUrl(artwork.imageUrl),
    }));

    return { items: mapped, total };
  }

  async fetchArtwork(id: string) {
    const artwork = await this.artworkResposioty.findById(id);

    if (!artwork) {
      this.logger.error(
        `method=fetchArtwork, Artwork not found with ID: '${id}'`,
      );

      throw new NotFoundException(`Artwork not found with ID: '${id}'`);
    }
    artwork;

    return {
      ...artwork,
      imageUrl: this.s3Service.getFileUrl(artwork.imageUrl),
    };
  }

  async getCategoriesValid(ids: string[]): Promise<Category[]> {
    const categories = await this.categoryRepository.findCategoryByIds(ids);

    if (categories.length !== ids.length) {
      const missingIds = ids.filter(
        (id) => !categories.some((c) => c.id === id),
      );

      this.logger.error(
        `method=getCategoriesValid, Some categories not found. Missing IDs: ${missingIds.join(', ')}`,
      );

      throw new NotFoundException(
        `One or more categories not found. Missing IDs: ${missingIds.join(', ')}`,
      );
    }

    return categories;
  }

  async updateArtwork(id: string, body: UpdateArtworkDto): Promise<Artwork> {
    const artwork = await this.artworkResposioty.findById(id);
    if (!artwork) {
      throw new NotFoundException(`Artwork not found with ID: '${id}'`);
    }

    // 🔍 Check title exists for another artwork
    if (body.title && body.title !== artwork.title) {
      const existing = await this.artworkResposioty.findByTitle(body.title);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Title '${body.title}' already exists. Please use a different title.`,
        );
      }
    }

    if (body.categoryIds) {
      const categories = await this.getCategoriesValid(body.categoryIds);
      artwork.categories = categories;
    }

    Object.assign(artwork, body);
    return this.artworkResposioty.saveArtwork(artwork);
  }
}
