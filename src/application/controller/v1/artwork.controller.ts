import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Roles } from 'src/application/decorator/roles.decorator';
import { CreateArtworkDto } from 'src/application/dto/artwork/create_artwork.dto';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { RolesGuard } from 'src/application/guard/roles.guard';
import { User, UserRole } from 'src/domain/entity/user.entity';
import { ArtworkService } from 'src/domain/service/artwork.service';
import { Express } from 'express';
import { AddImageResponseDto } from 'src/application/dto/artwork/add_image_response.dto';
import { plainToInstance } from 'class-transformer';
import { ArtworkResponseDto } from 'src/application/dto/artwork/artwork_response.dto';
import { FilterArtworkDto } from 'src/application/dto/artwork/filter_artwork.dto';
import { UpdateArtworkDto } from 'src/application/dto/artwork/update_artwork.dto';

@Controller('v1/artwork')
export class ArtworkController {
  constructor(private readonly artworkService: ArtworkService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async createArtwork(@Body() body: CreateArtworkDto, @Req() req: Request) {
    const artwork = await this.artworkService.createArtwork(
      body,
      req.user as User,
    );

    return plainToInstance(ArtworkResponseDto, artwork, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/upload_image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async addImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AddImageResponseDto> {
    return this.artworkService.uploadImage(file);
  }

  @Get()
  async getArtworks(@Query() query: FilterArtworkDto) {
    const result = await this.artworkService.fetchArtworks(query);

    return {
      items: plainToInstance(ArtworkResponseDto, result.items, {
        excludeExtraneousValues: true,
      }),
      total: result.total,
      page: query.page,
      limit: query.limit,
    };
  }

  @Get('/:id')
  async getArtwork(@Param('id') id: string, @Req() req: Request) {
    const artwork = await this.artworkService.fetchArtwork(id);

    return plainToInstance(ArtworkResponseDto, artwork, {
      excludeExtraneousValues: true,
    });
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async updateArtwork(
    @Param('id') id: string,
    @Body() body: UpdateArtworkDto,
  ): Promise<ArtworkResponseDto> {
    const artwork = await this.artworkService.updateArtwork(id, body);
    return plainToInstance(ArtworkResponseDto, artwork, {
      excludeExtraneousValues: true,
    });
  }
}
