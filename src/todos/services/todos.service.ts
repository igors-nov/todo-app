import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { List } from '../../lists/entities/list.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(
    title: string,
    listId: string,
    parentId?: string,
    description?: string,
  ): Promise<Todo> {
    const todo = new Todo();
    todo.title = title;
    todo.description = description;

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException();
    }
    todo.list = list;

    if (parentId) {
      const parent = await this.todoRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException();
      }
      todo.parent = parent;
    }

    return await this.todoRepository.save(todo);
  }

  async findAll(listId: string): Promise<Todo[]> {
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException();
    }

    // Custom query used instead of NestJS built in Tree because of known Tree limitations on updating child item parents.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: (Todo & { parentId: string })[] =
      await this.todoRepository.query(
        `
        WITH RECURSIVE hierarchy AS (
            SELECT * FROM todo 
            WHERE "parentId" IS NULL AND "listId" = $1
            UNION ALL
            SELECT i.* FROM todo i
            INNER JOIN hierarchy h ON i."parentId" = h."id"
        )
        SELECT * FROM hierarchy
        ORDER BY "parentId" NULLS FIRST, position;
    `,
        [listId],
      );

    return this.buildHierarchy(result);
  }

  //TODO: Can be moved to front-end, so that tree hierarchy is built on client side
  private buildHierarchy(flatList: (Todo & { parentId: string })[]): Todo[] {
    const map = new Map<string, Todo>();

    flatList.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    const rootItems: Todo[] = [];

    flatList.forEach((item) => {
      if (item.parentId === null) {
        rootItems.push(map.get(item.id)!);
      } else {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(map.get(item.id)!);
        }
      }
    });

    return rootItems;
  }

  async update(
    id: string,
    completed: boolean,
    description?: string,
  ): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException();
    }

    todo.completed = completed;

    if (description !== undefined) {
      todo.description = description;
    }

    return await this.todoRepository.save(todo);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.todoRepository.delete({ id });
  }

  async reorderTasks(items: Todo[], newParent: string | null): Promise<void> {
    const orderedTasks = this.createPositions(items, newParent);

    await Promise.all([
      ...orderedTasks.map(async (task) => {
        await this.todoRepository.update(task.id, {
          parent: task.parent,
          position: task.position,
        });
      }),
    ]);
  }

  private createPositions(
    items: Todo[],
    parentId: string | null = null,
  ): Todo[] {
    return items.map((task, index) => {
      task.position = index;
      task.parent = parentId ? ({ id: parentId } as Todo) : null;
      return task;
    });
  }
}
