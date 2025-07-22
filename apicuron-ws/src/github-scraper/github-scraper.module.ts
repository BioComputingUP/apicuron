import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrcidFetcherController } from './github-scrapper.controller';
import { GithubScraperService } from './github-scraper.service';

@Module({
	imports: [HttpModule],
	controllers: [OrcidFetcherController],
	providers: [GithubScraperService],
})
export class OrcidFetcherModule {}
