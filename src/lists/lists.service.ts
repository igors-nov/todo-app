import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { List, ListProtection } from './entities/list.entity';
import * as bcrypt from 'bcrypt';
import { CreateListDto } from './dto/createList.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(newList: CreateListDto): Promise<List> {
    const password = await bcrypt.hash(newList.password, 10);

    const list = new List();
    list.name = newList.name;
    list.protection = newList.protection;
    list.password = password;
    list.uniqueUrl = this.generateUniqueId();

    return this.listRepository.save(list);
  }

  private generateUniqueId() {
    return Math.random().toString(16).slice(2);
  }

  async findAll(): Promise<List[]> {
    return this.listRepository.find({ relations: ['todos'] });
  }

  async findOne(uniqueUrl: string): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { uniqueUrl },
    });

    if (!list) {
      throw new NotFoundException();
    }

    return list;
  }

  async findOneById(id: string): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException();
    }

    return list;
  }

  async delete(uniqueUrl: string): Promise<DeleteResult> {
    return this.listRepository.delete({ uniqueUrl });
  }

  async checkPassword(
    list: List,
    password: string,
    enableException = true,
  ): Promise<boolean> {
    const result =
      !password || password.length === 0
        ? false
        : await bcrypt.compare(password, list.password);

    if (!result && enableException) {
      throw new ForbiddenException();
    }

    return result;
  }

  async toggleFreeze(list: List): Promise<UpdateResult> {
    return this.listRepository.update(list.id, { frozen: !list.frozen });
  }

  async checkListEditProtection(id: string, password: string) {
    const list = await this.findOneById(id);

    if (
      [ListProtection.PasswordProtected, ListProtection.ViewAccess].some(
        (prot) => prot === list.protection,
      )
    ) {
      await this.checkPassword(list, password || '');
    }
  }
}
