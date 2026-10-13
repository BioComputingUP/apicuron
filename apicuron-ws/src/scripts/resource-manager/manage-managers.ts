import { HttpException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ResourceManagerService } from 'src/resource-manager/services/resource-manager.service';

const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const USAGE =
	'Usage: node dist/scripts/resource-manager/manage-managers.js <add|remove> <resource_id> <orcid_id>\n' +
	'       node dist/scripts/resource-manager/manage-managers.js list <resource_id>';

async function bootstrap() {
	const logger = new Logger('ManageResourceManagersScript');
	const [action, resource_id, orcid_id] = process.argv.slice(2);
	const needsOrcid = action === 'add' || action === 'remove';
	if (
		!resource_id ||
		!(needsOrcid || action === 'list') ||
		(needsOrcid && !ORCID_REGEX.test(orcid_id ?? ''))
	) {
		logger.error(USAGE);
		process.exit(1);
	}

	const app = await NestFactory.createApplicationContext(AppModule);
	const managers = app.get(ResourceManagerService);

	try {
		if (action === 'add') {
			const { added } = await managers.addManager(resource_id, orcid_id);
			logger.log(
				added
					? `${orcid_id} now manages ${resource_id}`
					: `${orcid_id} already manages ${resource_id}`,
			);
		} else if (action === 'remove') {
			const { removed } = await managers.removeManager(resource_id, orcid_id);
			logger.log(
				removed
					? `${orcid_id} no longer manages ${resource_id}`
					: `${orcid_id} does not manage ${resource_id}`,
			);
		}

		const current = await managers.listManagers(resource_id);
		logger.log(
			`Managers of ${resource_id}: ${
				current.map((m) => `${m.displayedName} (${m.orcid_id})`).join(', ') ||
				'none'
			}`,
		);
	} catch (err) {
		if (err instanceof HttpException) {
			logger.error(err.message); // unknown resource/user, last manager...
			process.exitCode = 1;
			return;
		}
		throw err;
	} finally {
		await app.close();
	}
}

void bootstrap();
