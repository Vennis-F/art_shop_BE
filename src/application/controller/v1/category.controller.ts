import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/category/create_category.dto';
import { CategoryService } from '../../../domain/service/category.service';
import { CategoryResponseDto } from '../../dto/category/category_response.dto';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(@Body() body: CreateCategoryDto): Promise<void> {
    return await this.categoryService.createCategory(body);
  }

  @Get('/parent')
  async getParentCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getParentCategories();
  }

  @Get()
  async getCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.findAll();
  }

  @Get('/parent/:parentCategoryId/children')
  async getChildrenCategories(
    @Param('parentCategoryId') parentCategoryId: string,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getChildrenCategories(parentCategoryId);
  }

  @Delete('/:id')
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return await this.categoryService.deleteCategory(id);
  }

  @Put('/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: CreateCategoryDto,
  ): Promise<void> {
    return await this.categoryService.updateCategory(id, body);
  }
}
