import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { LinksService } from '../links/links.service';

@Controller('r')
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    try {
      const link = await this.linksService.getByCode(code);
      // Perform standard 302 Found browser redirect
      return res.redirect(302, link.longUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json({ statusCode: 404, message: 'Not Found' });
      }
      // Log errors internally but hide stack traces from the public client
      return res.status(404).json({ statusCode: 404, message: 'Not Found' });
    }
  }
}
