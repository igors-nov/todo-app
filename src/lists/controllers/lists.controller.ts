import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ListService } from '../services/lists.service';
import { List, ListProtection } from '../entities/list.entity';
import { plainToInstance } from 'class-transformer';
import { CreateListDto } from '../dto/createList.dto';
import { PermissionGuard } from 'src/auth/permission.guard';

@Controller('lists')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  async create(@Body() createListDto: CreateListDto) {
    return this.listService.create(createListDto);
  }

  @Post(':uniqueUrl/login')
  async login(
    @Param('uniqueUrl') uniqueUrl: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOne(uniqueUrl);

    return this.listService.login(list, password);
  }

  @UseGuards(PermissionGuard(ListProtection.PasswordProtected))
  @Post(':uniqueUrl/freeze')
  async freeze(@Param('uniqueUrl') uniqueUrl: string) {
    const list = await this.listService.findOne(uniqueUrl);

    return this.listService.toggleFreeze(list);
  }

  @UseGuards(PermissionGuard(ListProtection.ViewAccess))
  @Get(':uniqueUrl')
  async findOne(@Param('uniqueUrl') uniqueUrl: string) {
    const list = await this.listService.findOne(uniqueUrl);

    return plainToInstance(List, list);
  }

  @UseGuards(PermissionGuard(ListProtection.PasswordProtected))
  @Delete(':uniqueUrl')
  async delete(@Param('uniqueUrl') uniqueUrl: string) {
    return this.listService.delete(uniqueUrl);
  }
}
