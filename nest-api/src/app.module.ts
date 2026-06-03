import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksModule } from './links/links.module';
import { RedirectController } from './redirect/redirect.controller';

// Cache verification: source-only edits keep dependency layers cached.
@Module({
  imports: [LinksModule],
  controllers: [AppController, RedirectController],
  providers: [AppService],
})
export class AppModule {}
