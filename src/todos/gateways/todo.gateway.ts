import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TodoService } from '../todos.service';
import { Todo } from '../entities/todo.entity';
import { ListService } from 'src/lists/lists.service';

//TODO: Setup cors correctly
@WebSocketGateway({ cors: true })
export class TodoGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly todoService: TodoService,
    private readonly listService: ListService,
  ) {}

  @SubscribeMessage('createTodo')
  async handleCreateTodo(
    @MessageBody()
    data: {
      title: string;
      listId: string;
      parentId?: string;
      description?: string;
      password?: string;
    },
  ) {
    if (!data.title || data.title.length === 0) {
      return this.server.emit(
        `list:${data.listId}:error`,
        'Task title can not be empty',
      );
    }

    await this.listService.checkListEditProtection(
      data.listId,
      data.password || '',
    );

    const todo = await this.todoService.create(
      data.title,
      data.listId,
      data.parentId,
      data.description,
    );
    if (data.parentId) {
      return this.server.emit(`list:${data.listId}:subtaskCreated`, {
        parentId: data.parentId,
        subtask: todo,
      });
    } else {
      return this.server.emit(`list:${data.listId}:todoCreated`, todo);
    }
  }

  @SubscribeMessage('updateTodo')
  async handleUpdateTodo(
    @MessageBody()
    data: {
      id: string;
      completed: boolean;
      listId: string;
      description?: string;
      password?: string;
    },
  ) {
    await this.listService.checkListEditProtection(
      data.listId,
      data.password || '',
    );

    const todo = await this.todoService.update(
      data.id,
      data.completed,
      data.description,
    );

    return this.server.emit(`list:${todo.list.id}:todoUpdated`, todo);
  }

  @SubscribeMessage('deleteTodo')
  async handleDeleteTodo(
    @MessageBody() data: { id: string; listId: string; password?: string },
  ) {
    await this.listService.checkListEditProtection(
      data.listId,
      data.password || '',
    );

    await this.todoService.delete(data.id);

    return this.server.emit(`list:${data.listId}:todoDeleted`, data.id);
  }

  @SubscribeMessage('orderTodo')
  async handleOrderTodo(
    @MessageBody()
    data: {
      listId: string;
      items: Todo[];
      newParent: string | null;
      password?: string;
    },
  ) {
    await this.listService.checkListEditProtection(
      data.listId,
      data.password || '',
    );

    await this.todoService.reorderTasks(data.items, data.newParent);
    const todos = await this.todoService.findAll(data.listId);

    return this.server.emit(`list:${data.listId}:todoReordered`, todos);
  }

  @SubscribeMessage('toggleFreezeList')
  async toggleFreezeList(
    @MessageBody()
    data: {
      listId: string;
      password: string;
    },
  ) {
    const list = await this.listService.findOneById(data.listId);
    await this.listService.checkPassword(list, data.password);

    await this.listService.toggleFreeze(list);

    return this.server.emit(`list:${list.id}:freezeToggle`, {
      ...list,
      frozen: !list.frozen,
    });
  }
}
