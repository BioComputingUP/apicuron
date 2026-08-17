import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { PendingReport } from '../entities/pending-report.entity';
import { PendingReportsRepository } from '../repository/pending-report.repository';

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
			if (error instanceof MongoServerError && error.code === 11000) {
				throw new BadRequestException('Pending report already exists');
			}
			this.logger.error;
			throw new InternalServerErrorException('Could not create pending report');
		}
	}
}
