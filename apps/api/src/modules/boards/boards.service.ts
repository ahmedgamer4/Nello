import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { DB, DBType } from '@/modules/global/providers/db.provider';
import { board } from '@/_schemas/board';
import { eq } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BoardsService {
  constructor(
    @Inject(DB) private readonly db: DBType,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createBoardDto: CreateBoardDto) {
    try {
      const res = await this.db
        .insert(board)
        .values(createBoardDto)
        .returning();
      return res[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot board user. ${error}`);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;
      const res = await this.db
        .select()
        .from(board)
        .limit(limit)
        .offset(offset);
      return res;
    } catch (error) {
      throw new InternalServerErrorException(`Cannot find boards. ${error}`);
    }
  }

  async findOne(id: number) {
    try {
      const res = await this.db.select().from(board).where(eq(board.id, id));
      return res[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot retrieve board. ${error}`);
    }
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    try {
      const res = await this.db
        .update(board)
        .set(updateBoardDto)
        .where(eq(board.id, id))
        .returning();
      return res[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot update board. ${error}`);
    }
  }

  async remove(id: number) {
    try {
      const res = await this.db
        .delete(board)
        .where(eq(board.id, id))
        .returning();

      return res[0];
    } catch (error) {
      throw new InternalServerErrorException(`Cannot remove board . ${error}`);
    }
  }

  async putCoverImage(file: Express.Multer.File, id: number) {
    try {
      const uploadedFile = await this.cloudinaryService.uploadImage(file);
      const modifiedBoard = await this.update(id, {
        imageUrl: (uploadedFile as any).url,
      });
      return modifiedBoard;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
