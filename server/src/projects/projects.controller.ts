import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('clients/:clientId/projects')
  findForClient(@Param('clientId') clientId: string) {
    return this.projectsService.findForClient(clientId);
  }

  @Post('clients/:clientId/projects')
  createForClient(
    @Param('clientId') clientId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createForClient(clientId, dto);
  }

  @Get('projects/:id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch('projects/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete('projects/:id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
