/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, MinLength, Length } from 'class-validator';
import { ListProtection } from '../entities/list.entity';

export class CreateListDto {
  @Length(1, 50)
  name: string;

  @IsEnum(ListProtection)
  protection: ListProtection;

  @MinLength(6)
  password: string;
}
