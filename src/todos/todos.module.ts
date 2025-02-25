import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodoController } from './todos.controller';
import { TodoService } from './todos.service';
import { List } from '../lists/entities/list.entity';
import { TodoGateway } from './gateways/todo.gateway';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    TypeOrmModule.forFeature([List]),
    ListsModule,
  ],
  controllers: [TodoController],
  providers: [TodoService, TodoGateway],
  exports: [TodoService],
})
export class TodosModule {}
