import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  it('aggregates request summary counts', async () => {
    const count = jest
      .fn()
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);

    const moduleRef = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: {
            request: { count },
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(DashboardService);

    await expect(service.getSummary()).resolves.toEqual({
      totalRequests: 10,
      newRequests: 3,
      inProgressRequests: 2,
      blockedRequests: 1,
      doneRequests: 4,
      highOrUrgentPriorityRequests: 3,
    });
  });
});
