import { Priority, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: {
    project: { findUnique: jest.Mock };
    request: { findUnique: jest.Mock; findMany: jest.Mock; delete: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: {
    request: { create: jest.Mock; update: jest.Mock };
    auditEvent: { create: jest.Mock };
  };

  beforeEach(() => {
    tx = {
      request: {
        create: jest.fn(),
        update: jest.fn(),
      },
      auditEvent: {
        create: jest.fn(),
      },
    };

    prisma = {
      project: {
        findUnique: jest.fn().mockResolvedValue({ id: 'project-1' }),
      },
      request: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    };

    service = new RequestsService(prisma as unknown as PrismaService);
  });

  it('creates an audit event when a request is created', async () => {
    const created = {
      id: 'request-1',
      projectId: 'project-1',
      title: 'Add account export',
      description: 'Export account data.',
      status: RequestStatus.NEW,
      priority: Priority.HIGH,
      requestType: RequestType.FEATURE,
      createdBy: 'demo@example.com',
      assignedTo: null,
    };
    tx.request.create.mockResolvedValue(created);
    tx.auditEvent.create.mockResolvedValue({ id: 'audit-1' });

    await expect(
      service.createForProject(
        'project-1',
        {
          title: created.title,
          description: created.description,
          priority: Priority.HIGH,
          requestType: RequestType.FEATURE,
        },
        'demo@example.com',
      ),
    ).resolves.toEqual(created);

    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actor: 'demo@example.com',
        action: 'REQUEST_CREATED',
        entityType: 'Request',
        entityId: 'request-1',
        after: {
          status: RequestStatus.NEW,
          priority: Priority.HIGH,
          title: 'Add account export',
        },
      },
    });
  });

  it('creates an audit event when status or priority changes', async () => {
    prisma.request.findUnique.mockResolvedValue({
      id: 'request-1',
      status: RequestStatus.NEW,
      priority: Priority.MEDIUM,
    });
    tx.request.update.mockResolvedValue({
      id: 'request-1',
      status: RequestStatus.DONE,
      priority: Priority.HIGH,
    });
    tx.auditEvent.create.mockResolvedValue({ id: 'audit-1' });

    await service.update(
      'request-1',
      {
        status: RequestStatus.DONE,
        priority: Priority.HIGH,
      },
      'demo@example.com',
    );

    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actor: 'demo@example.com',
        action: 'REQUEST_UPDATED',
        entityType: 'Request',
        entityId: 'request-1',
        before: {
          status: RequestStatus.NEW,
          priority: Priority.MEDIUM,
        },
        after: {
          status: RequestStatus.DONE,
          priority: Priority.HIGH,
        },
      },
    });
  });
});
