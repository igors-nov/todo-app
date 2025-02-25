import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from './lists.controller';
import { ListService } from '../services/lists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { List } from '../entities/list.entity';
import { Repository } from 'typeorm';
import { TodoService } from '../../todos/todos.service';
import { Todo } from '../../todos/entities/todo.entity';

describe('ListController', () => {
  let controller: ListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        ListService,
        TodoService,
        {
          provide: getRepositoryToken(List),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Todo),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ListController>(ListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
