import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TodoService } from '../services/todos.service';
import { ListProtection } from 'src/lists/entities/list.entity';
import { PermissionGuard } from 'src/auth/permission.guard';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(PermissionGuard(ListProtection.ViewAccess))
  @Get(':listId')
  async findAll(@Param('listId') listId: string) {
    return this.todoService.findAll(listId);
  }
}
