import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('requests/:requestId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findForRequest(@Param('requestId') requestId: string) {
    return this.commentsService.findForRequest(requestId);
  }

  @Post()
  createForRequest(
    @Param('requestId') requestId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createForRequest(requestId, dto);
  }
}
