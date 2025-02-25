import { Exclude } from 'class-transformer';
import { Todo } from '../../todos/entities/todo.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum ListProtection {
  FullAccess = 1,
  ViewAccess,
  PasswordProtected,
}

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uniqueUrl: string;

  @Column()
  name: string;

  @Column({ type: 'boolean', default: false })
  frozen: boolean;

  @Column()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Exclude()
  password: string;

  @Column({ type: 'int2' })
  protection: ListProtection;

  @OneToMany(() => Todo, (todo) => todo.list)
  todos: Todo[];
}
