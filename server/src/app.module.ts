import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { CommentsModule } from './comments/comments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    ClientsModule,
    ProjectsModule,
    RequestsModule,
    CommentsModule,
    DashboardModule,
  ],
})
export class AppModule {}
