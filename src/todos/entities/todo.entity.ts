import { List } from '../../lists/entities/list.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => Todo, (item) => item.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Todo | null;

  @OneToMany(() => Todo, (item) => item.parent)
  children: Todo[];

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => List, (list) => list.todos, {
    eager: true,
    onDelete: 'CASCADE',
  })
  list: List;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
