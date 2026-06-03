import { Module } from '@nestjs/common';
import { LinksModule } from '../nest-api/src/links/links.module';
import { RedirectController } from '../nest-api/src/redirect/redirect.controller';

@Module({
  imports: [LinksModule],
  controllers: [RedirectController],
  providers: [],
})
export class AppModule {}
