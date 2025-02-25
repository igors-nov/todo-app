import { Body, Controller, Param, Post } from '@nestjs/common';
import { TodoService } from '../services/todos.service';
import { ListService } from '../../lists/services/lists.service';
import { ListProtection } from 'src/lists/entities/list.entity';

@Controller('todos')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly listService: ListService,
  ) {}

  @Post(':listId')
  async findAll(
    @Param('listId') listId: string,
    @Body('password') password: string,
  ) {
    const list = await this.listService.findOneById(listId);

    if (list.protection === ListProtection.PasswordProtected) {
      await this.listService.checkPassword(list, password);
    }

    return this.todoService.findAll(listId);
  }
}
