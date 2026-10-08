import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { GithubIdentitySyncService } from 'src/github-identity/github-identity-sync.service';

async function bootstrap() {
	const logger = new Logger('SyncGithubIdentityScript');
	const [orcid] = process.argv.slice(2);
	if (!orcid) {
		logger.error('Usage: node dist/scripts/software/sync-github-identity.js <orcid>');
		process.exit(1);
	}

	const app = await NestFactory.createApplicationContext(AppModule);
	try {
		await app.get(GithubIdentitySyncService).syncUser(orcid); // includes reconciliation
		logger.log(`GitHub identity synced for ${orcid}`);
	} finally {
		await app.close();
	}
}

void bootstrap();