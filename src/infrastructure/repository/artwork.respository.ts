import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArtworkDto } from 'src/application/dto/artwork/filter_artwork.dto';
import { Artwork } from 'src/domain/entity/artwork.entity';
import { Brackets, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ArtworkRepository {
  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  createArtwork(body: Partial<Artwork>): Promise<Artwork> {
    const artwork = this.artworkRepository.create(body);
    return this.artworkRepository.save(artwork);
  }

  findByTitle(title: string) {
    return this.artworkRepository.findOneBy({ title });
  }

  findById(id: string) {
    return this.artworkRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async findByIdPessimisticWithManager(
    id: string,
    manager: EntityManager,
  ): Promise<Artwork | null> {
    return manager
      .createQueryBuilder(Artwork, 'artwork')
      .setLock('pessimistic_write')
      .where('artwork.id = :id', { id })
      .getOne();
  }

  async filterArtworks(filter: FilterArtworkDto) {
    console.log(filter);
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    const qb = this.artworkRepository
      .createQueryBuilder('artwork')
      .leftJoinAndSelect('artwork.categories', 'category')
      .take(limit)
      .skip((page - 1) * limit);

    if (filter.search) {
      qb.andWhere('artwork.title ILIKE :search', {
        search: `%${filter.search}%`,
      });
    }

    if (filter.mediums?.length) {
      qb.andWhere('artwork.medium IN (:...mediums)', {
        mediums: filter.mediums,
      });
    }

    if (filter.categoryIds?.length) {
      qb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: filter.categoryIds,
      });
    }

    if (filter.dimensions?.length) {
      const dims = filter.dimensions;
      qb.andWhere(
        new Brackets((qb) => {
          dims.forEach((dim, idx) => {
            const [w, h] = dim.split('x').map(Number);
            qb.orWhere(
              `(artwork.width = :w${idx} AND artwork.height = :h${idx})`,
              {
                [`w${idx}`]: w,
                [`h${idx}`]: h,
              },
            );
          });
        }),
      );
    }

    if (filter.priceFrom != null) {
      qb.andWhere('artwork.price >= :priceFrom', {
        priceFrom: filter.priceFrom,
      });
    }
    if (filter.priceTo != null) {
      qb.andWhere('artwork.price <= :priceTo', { priceTo: filter.priceTo });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  saveArtwork(artwork: Artwork, manager?: EntityManager) {
    if (manager) {
      return manager.save(artwork);
    }
    return this.artworkRepository.save(artwork);
  }
}
