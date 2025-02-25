import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from './lists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { List } from '../entities/list.entity';
import { Repository } from 'typeorm';

describe('ListService', () => {
  let service: ListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getRepositoryToken(List),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
