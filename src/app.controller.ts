import { AuthController } from 'src/application/controller/v1/auth.controller';
import { CategoryController } from 'src/application/controller/v1/category.controller';
import { UserController } from 'src/application/controller/v1/user.controller';
import { FileController } from './application/controller/v1/file.controller';
import { ArtworkController } from './application/controller/v1/artwork.controller';
import { CartController } from './application/controller/v1/cart.controller';
import { OrderController } from './application/controller/v1/order.controller';

export const AppController = [
  UserController,
  CategoryController,
  AuthController,
  FileController,
  ArtworkController,
  CartController,
  OrderController,
];
