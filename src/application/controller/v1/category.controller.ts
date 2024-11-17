import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get()
  async getParentCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getParentCategories();
  }

  @Get('/:parentCategoryId/children')
  async getChildrenCategories(
    @Param('parentCategoryId') parentCategoryId: string,
  ): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getChildrenCategories(parentCategoryId);
  }
}
