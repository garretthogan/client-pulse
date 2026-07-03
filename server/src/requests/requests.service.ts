import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForProject(projectId: string, query: ListRequestsQueryDto) {
    await this.ensureProject(projectId);

    const where: Prisma.RequestWhereInput = {
      projectId,
      status: query.status,
      priority: query.priority,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.request.findMany({
      where,
      orderBy: {
        updatedAt: query.sort === 'updatedAt_asc' ? 'asc' : 'desc',
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async createForProject(
    projectId: string,
    dto: CreateRequestDto,
    actor: string,
  ) {
    await this.ensureProject(projectId);

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          ...dto,
          projectId,
          createdBy: actor,
        },
      });

      await tx.auditEvent.create({
        data: {
          actor,
          action: 'REQUEST_CREATED',
          entityType: 'Request',
          entityId: request.id,
          after: {
            status: request.status,
            priority: request.priority,
            title: request.title,
          },
        },
      });

      return request;
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        project: {
          include: { client: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async update(id: string, dto: UpdateRequestDto, actor: string) {
    const existing = await this.prisma.request.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Request not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id },
        data: dto,
      });

      const statusChanged =
        dto.status !== undefined && dto.status !== existing.status;
      const priorityChanged =
        dto.priority !== undefined && dto.priority !== existing.priority;

      if (statusChanged || priorityChanged) {
        await tx.auditEvent.create({
          data: {
            actor,
            action: 'REQUEST_UPDATED',
            entityType: 'Request',
            entityId: id,
            before: {
              status: existing.status,
              priority: existing.priority,
            },
            after: {
              status: updated.status,
              priority: updated.priority,
            },
          },
        });
      }

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.request.delete({
      where: { id },
    });
  }

  private async ensureProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }
}
