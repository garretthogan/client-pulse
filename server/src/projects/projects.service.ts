import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForClient(clientId: string) {
    await this.ensureClient(clientId);

    return this.prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { requests: true },
        },
      },
    });
  }

  async createForClient(clientId: string, dto: CreateProjectDto) {
    await this.ensureClient(clientId);

    return this.prisma.project.create({
      data: {
        ...dto,
        clientId,
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        _count: {
          select: { requests: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  private async ensureClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }
}
