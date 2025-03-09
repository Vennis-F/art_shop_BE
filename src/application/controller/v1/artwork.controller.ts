import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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

  @Get('/')
  async getArtworks(@Req() req: Request) {
    const artworks = await this.artworkService.fetchArtworks();

    return plainToInstance(ArtworkResponseDto, artworks, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/:id')
  async getArtwork(@Param('id') id: string, @Req() req: Request) {
    const artwork = await this.artworkService.fetchArtwork(id);

    return plainToInstance(ArtworkResponseDto, artwork, {
      excludeExtraneousValues: true,
    });
  }
}
