import { Body, Controller, Post } from '@nestjs/common';
import { CreateCategoryDto } from '../../dto/category/create_category.dto';
import { CategoryService } from '../../../domain/service/category.service';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(@Body() body: CreateCategoryDto): Promise<void> {
    return await this.categoryService.createCategory(body);
  }
}
