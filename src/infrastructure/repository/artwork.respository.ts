import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artwork } from 'src/domain/entity/artwork.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArtworkRepository {
  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  createArtwork(body: Partial<Artwork>): Promise<Artwork> {
    return this.artworkRepository.save(body);
  }

  findByTitle(title: string) {
    return this.artworkRepository.findOneBy({ title });
  }
}
