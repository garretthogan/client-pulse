import { Injectable } from '@nestjs/common';
import { Priority, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalRequests,
      newRequests,
      inProgressRequests,
      blockedRequests,
      doneRequests,
      highPriorityRequests,
      urgentPriorityRequests,
    ] = await Promise.all([
      this.prisma.request.count(),
      this.prisma.request.count({ where: { status: RequestStatus.NEW } }),
      this.prisma.request.count({
        where: { status: RequestStatus.IN_PROGRESS },
      }),
      this.prisma.request.count({ where: { status: RequestStatus.BLOCKED } }),
      this.prisma.request.count({ where: { status: RequestStatus.DONE } }),
      this.prisma.request.count({ where: { priority: Priority.HIGH } }),
      this.prisma.request.count({ where: { priority: Priority.URGENT } }),
    ]);

    return {
      totalRequests,
      newRequests,
      inProgressRequests,
      blockedRequests,
      doneRequests,
      highOrUrgentPriorityRequests:
        highPriorityRequests + urgentPriorityRequests,
    };
  }
}
