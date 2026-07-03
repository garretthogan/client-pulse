import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForRequest(requestId: string) {
    await this.ensureRequest(requestId);

    return this.prisma.comment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createForRequest(requestId: string, dto: CreateCommentDto) {
    await this.ensureRequest(requestId);

    return this.prisma.comment.create({
      data: {
        ...dto,
        requestId,
      },
    });
  }

  private async ensureRequest(requestId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
  }
}
