import { Module } from '@nestjs/common';
import { ListService } from './services/lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { ListController } from './controllers/lists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([List])],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
})
export class ListsModule {}
