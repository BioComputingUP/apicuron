import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { GithubIdentitySyncService } from './github-identity-sync.service';
import { GithubUsersClient } from './github-users.client';

@Module({
	imports: [CoreApicuronModule, HttpModule],
	providers: [GithubUsersClient, GithubIdentitySyncService],
	exports: [GithubIdentitySyncService],
})
export class GithubIdentityModule {}