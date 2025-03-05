import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TodoService } from '../services/todos.service';
import { Todo } from '../entities/todo.entity';
import { ListService } from '../../lists/services/lists.service';
import { UseGuards } from '@nestjs/common';
import { SocketGuard } from 'src/auth/socket.guard';
import { ListProtection } from 'src/lists/entities/list.entity';

//TODO: Setup cors correctly
@WebSocketGateway({ cors: true })
export class TodoGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly todoService: TodoService,
    private readonly listService: ListService,
  ) {}

  @UseGuards(SocketGuard(ListProtection.FullAccess))
  @SubscribeMessage('createTodo')
  async handleCreateTodo(
    @MessageBody()
    data: {
      title: string;
      listId: string;
      parentId?: string;
      description?: string;
    },
  ) {
    if (!data.title || data.title.length === 0) {
      return this.server.emit(
        `list:${data.listId}:error`,
        'Task title can not be empty',
      );
    }

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

  @UseGuards(SocketGuard(ListProtection.FullAccess))
  @SubscribeMessage('updateTodo')
  async handleUpdateTodo(
    @MessageBody()
    data: {
      id: string;
      completed: boolean;
      listId: string;
      description?: string;
    },
  ) {
    const todo = await this.todoService.update(
      data.id,
      data.completed,
      data.description,
    );

    return this.server.emit(`list:${todo.list.id}:todoUpdated`, todo);
  }

  @UseGuards(SocketGuard(ListProtection.FullAccess))
  @SubscribeMessage('deleteTodo')
  async handleDeleteTodo(@MessageBody() data: { id: string; listId: string }) {
    await this.todoService.delete(data.id);

    return this.server.emit(`list:${data.listId}:todoDeleted`, data.id);
  }

  @UseGuards(SocketGuard(ListProtection.FullAccess))
  @SubscribeMessage('orderTodo')
  async handleOrderTodo(
    @MessageBody()
    data: {
      listId: string;
      items: Todo[];
      newParent: string | null;
    },
  ) {
    await this.todoService.reorderTasks(data.items, data.newParent);
    const todos = await this.todoService.findAll(data.listId);

    return this.server.emit(`list:${data.listId}:todoReordered`, todos);
  }

  @UseGuards(SocketGuard(ListProtection.PasswordProtected))
  @SubscribeMessage('toggleFreezeList')
  async toggleFreezeList(
    @MessageBody()
    data: {
      listId: string;
    },
  ) {
    const list = await this.listService.findOneById(data.listId);
    await this.listService.toggleFreeze(list);

    return this.server.emit(`list:${list.id}:freezeToggle`, {
      ...list,
      frozen: !list.frozen,
    });
  }
}
