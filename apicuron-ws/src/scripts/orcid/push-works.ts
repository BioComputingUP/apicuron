import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SubmitOrcidWork } from 'src/orcid/orcid-submission/submit-orcid.service';

const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const USAGE =
	'Usage: node dist/scripts/orcid/push-works.js --all\n' +
	'       node dist/scripts/orcid/push-works.js <orcid_id> [<orcid_id> ...]';

/**
 * Pushes APICURON works to ORCID records now, with the same pipeline as the nightly job:
 * --all for every public user with ORCID permission, or only the given ORCID iDs.
 */
async function bootstrap() {
	const logger = new Logger('PushOrcidWorksScript');
	const args = process.argv.slice(2);
	const all = args.length === 1 && args[0] === '--all';
	if (
		!all &&
		(args.length === 0 || !args.every((orcid) => ORCID_REGEX.test(orcid)))
	) {
		logger.error(USAGE);
		process.exit(1);
	}

	const app = await NestFactory.createApplicationContext(AppModule);
	try {
		const submitter = app.get(SubmitOrcidWork);

		if (all) {
			const processed = await submitter.submitAllWorks();
			logger.log(
				`Done for ${processed.length} user(s), see the log above for each work`,
			);
			return;
		}

		const processed = await submitter.submitAllWorks({
			orcid_id: { $in: args },
		});
		const skipped = args.filter((orcid) => !processed.includes(orcid));
		if (skipped.length > 0) {
			logger.warn(
				`Skipped (unknown, private or without ORCID permission): ${skipped.join(
					', ',
				)}`,
			);
		}
		logger.log(
			`Done for ${processed.length} of ${args.length} ORCID iD(s), see the log above for each work`,
		);
	} finally {
		await app.close();
	}
}

void bootstrap();
