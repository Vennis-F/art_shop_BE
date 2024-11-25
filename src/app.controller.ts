import { AuthController } from 'src/application/controller/v1/auth.controller';
import { CategoryController } from 'src/application/controller/v1/category.controller';
import { UserController } from 'src/application/controller/v1/user.controller';

export const AppController = [
  UserController,
  CategoryController,
  AuthController,
];
