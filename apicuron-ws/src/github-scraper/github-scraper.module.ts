import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GithubScraperController } from './github-scrapper.controller';
import { GithubScraperService } from './github-scraper.service';
import { ConfigurableModuleClass } from './github-scraper.providers';

@Module({
	imports: [HttpModule],
	controllers: [GithubScraperController],
	providers: [GithubScraperService],
})
export class GithubScraperModule extends ConfigurableModuleClass {}
