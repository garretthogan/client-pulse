import {
  PrismaClient,
  Priority,
  ProjectStatus,
  RequestStatus,
  RequestType,
} from '@prisma/client';
import { loadEnv } from '../src/env';

loadEnv();

const prisma = new PrismaClient();

async function main() {
  const seedIfEmpty = process.argv.includes('--if-empty');

  if (seedIfEmpty) {
    const existingClients = await prisma.client.count();

    if (existingClients > 0) {
      console.log('Demo seed skipped because client data already exists.');
      return;
    }
  } else {
    await prisma.auditEvent.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.request.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
  }

  const northstar = await prisma.client.create({
    data: {
      name: 'Northstar Health',
      contactName: 'Maya Benton',
      contactEmail: 'maya.benton@northstar.example',
    },
  });

  const atlas = await prisma.client.create({
    data: {
      name: 'Atlas Accounting Group',
      contactName: 'Jordan Lee',
      contactEmail: 'jordan.lee@atlas.example',
    },
  });

  const portalRefresh = await prisma.project.create({
    data: {
      clientId: northstar.id,
      name: 'Patient Portal Refresh',
      description: 'Modernize account screens and request intake workflows.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const analytics = await prisma.project.create({
    data: {
      clientId: northstar.id,
      name: 'Operations Analytics',
      description: 'Surface weekly operational metrics for clinic leaders.',
      status: ProjectStatus.PAUSED,
    },
  });

  const onboarding = await prisma.project.create({
    data: {
      clientId: atlas.id,
      name: 'Client Onboarding Hub',
      description: 'Centralize new customer document and task tracking.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const requestSeeds = [
    {
      projectId: portalRefresh.id,
      title: 'Fix appointment reschedule error',
      description: 'Patients see a generic failure after selecting a new slot.',
      status: RequestStatus.BLOCKED,
      priority: Priority.URGENT,
      requestType: RequestType.BUG,
      assignedTo: 'Avery Chen',
    },
    {
      projectId: portalRefresh.id,
      title: 'Add preferred pharmacy field',
      description: 'Collect pharmacy name and phone during patient profile edits.',
      status: RequestStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      requestType: RequestType.FEATURE,
      assignedTo: 'Sam Rivera',
    },
    {
      projectId: portalRefresh.id,
      title: 'Clarify notification copy',
      description: 'Rewrite reminder copy for missed intake forms.',
      status: RequestStatus.NEW,
      priority: Priority.MEDIUM,
      requestType: RequestType.CHANGE_REQUEST,
    },
    {
      projectId: portalRefresh.id,
      title: 'Confirm mobile menu behavior',
      description: 'Client wants to confirm expected menu behavior below 640px.',
      status: RequestStatus.DONE,
      priority: Priority.LOW,
      requestType: RequestType.QUESTION,
    },
    {
      projectId: analytics.id,
      title: 'Weekly export missing no-show rate',
      description: 'CSV export should include no-show percentage by clinic.',
      status: RequestStatus.NEW,
      priority: Priority.HIGH,
      requestType: RequestType.BUG,
    },
    {
      projectId: analytics.id,
      title: 'Add month-over-month comparison',
      description: 'Leadership dashboard needs trend deltas for all key metrics.',
      status: RequestStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      requestType: RequestType.FEATURE,
      assignedTo: 'Avery Chen',
    },
    {
      projectId: onboarding.id,
      title: 'Document upload progress stalls',
      description: 'Progress bar remains at 80 percent until upload completes.',
      status: RequestStatus.BLOCKED,
      priority: Priority.HIGH,
      requestType: RequestType.BUG,
      assignedTo: 'Priya Nair',
    },
    {
      projectId: onboarding.id,
      title: 'Add checklist templates',
      description: 'Account managers need repeatable onboarding task templates.',
      status: RequestStatus.NEW,
      priority: Priority.MEDIUM,
      requestType: RequestType.FEATURE,
    },
    {
      projectId: onboarding.id,
      title: 'Rename kickoff step',
      description: 'Change "Discovery" to "Kickoff" in the client-facing timeline.',
      status: RequestStatus.DONE,
      priority: Priority.LOW,
      requestType: RequestType.CHANGE_REQUEST,
      assignedTo: 'Sam Rivera',
    },
    {
      projectId: onboarding.id,
      title: 'Question about invite expiration',
      description: 'Client asked how long onboarding invitation links remain active.',
      status: RequestStatus.NEW,
      priority: Priority.LOW,
      requestType: RequestType.QUESTION,
    },
  ];

  const requests = [];

  for (const seed of requestSeeds) {
    const request = await prisma.request.create({
      data: {
        ...seed,
        createdBy: 'demo@example.com',
      },
    });
    requests.push(request);
  }

  await prisma.comment.createMany({
    data: [
      {
        requestId: requests[0].id,
        authorName: 'Maya Benton',
        body: 'This is blocking our scheduling team today.',
        isInternal: false,
      },
      {
        requestId: requests[0].id,
        authorName: 'Avery Chen',
        body: 'Waiting on the scheduling vendor API error payload.',
        isInternal: true,
      },
      {
        requestId: requests[1].id,
        authorName: 'Sam Rivera',
        body: 'Field and validation are built; QA pass is next.',
        isInternal: true,
      },
      {
        requestId: requests[6].id,
        authorName: 'Jordan Lee',
        body: 'Several clients noticed this during onboarding yesterday.',
        isInternal: false,
      },
      {
        requestId: requests[8].id,
        authorName: 'Priya Nair',
        body: 'Copy update shipped with the last deployment.',
        isInternal: true,
      },
    ],
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        actor: 'demo@example.com',
        action: 'REQUEST_CREATED',
        entityType: 'Request',
        entityId: requests[0].id,
        after: {
          status: requests[0].status,
          priority: requests[0].priority,
          title: requests[0].title,
        },
      },
      {
        actor: 'avery@example.com',
        action: 'REQUEST_UPDATED',
        entityType: 'Request',
        entityId: requests[0].id,
        before: { status: RequestStatus.NEW, priority: Priority.URGENT },
        after: { status: RequestStatus.BLOCKED, priority: Priority.URGENT },
      },
      {
        actor: 'sam@example.com',
        action: 'REQUEST_UPDATED',
        entityType: 'Request',
        entityId: requests[8].id,
        before: { status: RequestStatus.IN_PROGRESS, priority: Priority.LOW },
        after: { status: RequestStatus.DONE, priority: Priority.LOW },
      },
    ],
  });

  console.log('Demo seed data is ready.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
