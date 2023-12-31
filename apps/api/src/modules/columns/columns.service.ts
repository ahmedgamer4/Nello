import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { DB, DBType } from '../global/providers/db.provider';
import { column } from '@/_schemas/column';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class ColumnsService {
  constructor(@Inject(DB) private readonly db: DBType) {}

  async create(createColumnDto: CreateColumnDto, boardId: number) {
    try {
      const colCount = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(column)
        .where(eq(column.boardId, boardId));
      const newColumn = await this.db
        .insert(column)
        .values({ ...createColumnDto, position: ++colCount[0].count, boardId })
        .returning();

      return newColumn[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot create column. ${error}`);
    }
  }

  async findAll(boardId: number) {
    try {
      const columns = await this.db
        .select()
        .from(column)
        .where(eq(column.boardId, boardId));

      return columns;
    } catch (error) {
      throw new InternalServerErrorException(`Cannot find columns. ${error}`);
    }
  }

  async findOne(id: number) {
    try {
      const foundColumn = await this.db
        .select()
        .from(column)
        .where(eq(column.id, id));

      return foundColumn[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot find column. ${error}`);
    }
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    try {
      const updatedColumn = await this.db
        .update(column)
        .set({ ...updateColumnDto, updatedAt: new Date() })
        .where(eq(column.id, id))
        .returning();

      return updatedColumn[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot update column. ${error}`);
    }
  }

  async remove(id: number) {
    try {
      const removedColumn = await this.db
        .delete(column)
        .where(eq(column.id, id))
        .returning();

      return removedColumn[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot remove column. ${error}`);
    }
  }
}
