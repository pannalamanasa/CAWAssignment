import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  create(@Body() dto: CreateLinkDto) {
    return this.linksService.create(dto);
  }

  @Get()
  list(@Query('page') page?: string, @Query('page_size') pageSize?: string) {
    return this.linksService.list(Number(page ?? 1), Number(pageSize ?? 20));
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.linksService.getById(id);
  }
}
