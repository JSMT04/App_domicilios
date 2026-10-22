import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import {
  RestaurantsController,
  CategoriesController,
  MenuItemsController,
} from './catalog.controller';

@Module({
  controllers: [RestaurantsController, CategoriesController, MenuItemsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
