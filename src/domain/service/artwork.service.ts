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

@Injectable()
export class ArtworkService {
  private logger = new Logger(ArtworkService.name, { timestamp: true });

  constructor(
    private readonly artworkResposioty: ArtworkRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async createArtwork(body: CreateArtworkDto, user: User): Promise<Artwork> {
    await this.isTitleExist(body.title);

    const artwork = await this.artworkResposioty.createArtwork({
      ...body,
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

  async fetchArtworks(): Promise<Artwork[]> {
    const artworks = await this.artworkResposioty.findAll();

    this.logger.log(
      `method=fetchArtworks, ${artworks.length} artworks fetched.`,
    );

    return artworks;
  }

  async fetchArtwork(id: string): Promise<Artwork> {
    const artwork = await this.artworkResposioty.findById(id);

    if (!artwork) {
      this.logger.error(
        `method=fetchArtwork, Artwork not found with ID: '${id}'`,
      );

      throw new NotFoundException(`Artwork not found with ID: '${id}'`);
    }

    return artwork;
  }
}
