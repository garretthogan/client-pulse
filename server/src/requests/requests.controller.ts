import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { getDemoUser } from '../common/demo-user';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@Controller()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('projects/:projectId/requests')
  findForProject(
    @Param('projectId') projectId: string,
    @Query() query: ListRequestsQueryDto,
  ) {
    return this.requestsService.findForProject(projectId, query);
  }

  @Post('projects/:projectId/requests')
  createForProject(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRequestDto,
    @Headers('x-demo-user') demoUser: string | string[] | undefined,
  ) {
    return this.requestsService.createForProject(
      projectId,
      dto,
      getDemoUser(demoUser),
    );
  }

  @Get('requests/:id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch('requests/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @Headers('x-demo-user') demoUser: string | string[] | undefined,
  ) {
    return this.requestsService.update(id, dto, getDemoUser(demoUser));
  }

  @Delete('requests/:id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
