import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { PendingReport } from '../entities/pending-report.entity';
import { PendingReportsRepository } from '../repository/pending-report.repository';
import { ContributorIdentifierType } from 'src/core/enums';

@Injectable()
export class PendingReportsService {
	private readonly logger = new Logger(PendingReportsService.name);
	constructor(private readonly repository: PendingReportsRepository) {}

	async createPendingReport({
		resource_id,
		entity_uri,
		activity_term,
		timestamp,
		contributor_identifier,
		contributor_identifier_type,
	}: PendingReport) {
		try {
			await this.repository.save({
				resource_id,
				entity_uri,
				activity_term,
				timestamp,
				contributor_identifier,
				contributor_identifier_type,
			});
		} catch (error: unknown) {
			if (error instanceof ConflictException) {
				throw new ConflictException('Pending report already exists');
			}
			this.logger.error(error);
			throw new InternalServerErrorException(
				'Could not create pending report. If this error persists, please contact support.',
			);
		}
	}

	async findPendingReportsForContributor(
		contributorIdentifier: string,
		contributorIdentifierType: ContributorIdentifierType,
	): Promise<PendingReport[]> {
		return this.repository.findByContributorIdentifier(
			contributorIdentifier,
			contributorIdentifierType,
		);
	}

	async findPendingReportsForResource(
		resourceId: string,
	): Promise<PendingReport[]> {
		return this.repository.findByResourceId(resourceId);
	}
}
