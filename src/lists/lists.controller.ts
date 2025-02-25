import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { ListService } from './lists.service';
import { List, ListProtection } from './entities/list.entity';
import { plainToInstance } from 'class-transformer';
import { CreateListDto } from './dto/createList.dto';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  async create(@Body() createListDto: CreateListDto) {
    return this.listService.create(createListDto);
  }

  @Post(':uniqueUrl/password')
  async passwordCheck(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOne(uniqueUrl);

    return this.listService.checkPassword(list, password, false);
  }

  @Post(':uniqueUrl/freeze')
  async freeze(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOne(uniqueUrl);
    await this.listService.checkPassword(list, password);

    return this.listService.toggleFreeze(list);
  }

  @Post(':uniqueUrl')
  async findOne(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOne(uniqueUrl);

    if (list.protection === ListProtection.PasswordProtected) {
      const passwordCheck = await this.listService.checkPassword(
        list,
        password,
        false,
      );

      if (!passwordCheck) {
        return { protection: 3 };
      }
    }

    return plainToInstance(List, list);
  }

  @Delete(':uniqueUrl')
  async delete(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOne(uniqueUrl);
    await this.listService.checkPassword(list, password);

    return this.listService.delete(uniqueUrl);
  }
}
