import { Controller, Get, Param } from '@nestjs/common';
import { ItemProfile, ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async findAllItem(): Promise<ItemProfile[]> {
    return await this.itemService.findAllItem();
  }

  @Get(':id')
  async findItem(@Param('id') itemId: string): Promise<ItemProfile> {
    return await this.itemService.findItem(itemId);
  }
}
