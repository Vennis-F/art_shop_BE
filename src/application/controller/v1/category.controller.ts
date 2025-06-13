import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/category/create_category.dto';
import { CategoryService } from '../../../domain/service/category.service';
import { CategoryResponseTestDto } from '../../dto/category/category_test_response.dto';
import { Roles } from 'src/application/decorator/roles.decorator';
import { User, UserRole } from 'src/domain/entity/user.entity';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { RolesGuard } from 'src/application/guard/roles.guard';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from 'src/application/dto/category/category_response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddImageResponseDto } from 'src/application/dto/category/add_image_response.dto';
import { UpdateCategoryDto } from 'src/application/dto/category/update_category.dto';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.findAll();
  }

  @Get('/tree')
  async getTreeCategories(): Promise<CategoryResponseTestDto[]> {
    const categories = await this.categoryService.findTreeCategories();

    return plainToInstance(CategoryResponseTestDto, categories);
  }

  @Get('/:id')
  async getCategory(@Param('id') id: string, @Req() req: Request) {
    const category = await this.categoryService.fetchCategory(id);

    return plainToInstance(CategoryResponseTestDto, category, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/parent')
  async getParentCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getParentCategories();
  }

  @Get('/parent/:parentCategoryId/children')
  async getChildrenCategories(
    @Param('parentCategoryId') parentCategoryId: string,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getChildrenCategories(parentCategoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async createCategory(
    @Body() body: CreateCategoryDto,
    @Req() req: Request,
  ): Promise<void> {
    return await this.categoryService.createCategory(body, req.user as User);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<void> {
    return await this.categoryService.updateCategory(id, body);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return await this.categoryService.deleteCategory(id);
  }

  @Post('/upload_image')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async addImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AddImageResponseDto> {
    return this.categoryService.uploadImage(file);
  }
}
