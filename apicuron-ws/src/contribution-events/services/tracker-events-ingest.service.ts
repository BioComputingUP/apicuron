import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';
import { SourceSystem } from 'src/core/schemas/components/resource-source.schema';
import { User } from 'src/core/schemas/user.schema';
import { assertUserManagesResource } from 'src/util/authrization.helpers';
import { TrackerEventDto } from '../dto/tracker-event.dto';
import { ContributionEventsRepository } from '../repository/contribution-events.repository';
import { ResourceSourceRepository } from '../repository/resource-source.repository';
import { BatchIngestResult, IngestResult } from '../types/types';

const GITHUB_SOURCE = /^github:repository:(\d+)$/; // helper to separate the source system from the repository id, e.g. github:repository:123456789
type RawEvent = Record<string, unknown>;

@Injectable()
export class TrackerEventsIngestService {
	constructor(
		private readonly sources: ResourceSourceRepository,
		private readonly events: ContributionEventsRepository,
	) {}

	async ingest(
		raw: RawEvent,
		dto: TrackerEventDto,
		user: User,
	): Promise<IngestResult> {
		const resourceId = await this.authorize(dto, user, new Map());
		return this.store(raw, dto, resourceId);
	}

	async ingestBatch(
		raws: RawEvent[],
		dtos: TrackerEventDto[],
		user: User,
	): Promise<BatchIngestResult> {
		// All-or-nothing: authorise every event before storing any
		const cache = new Map<string, string | null>();
		const resourceIds: string[] = [];
		const failures: Array<{ index: number; event_id: string; reason: string }> =
			[];

		for (let i = 0; i < dtos.length; i++) {
			try {
				resourceIds[i] = await this.authorize(dtos[i], user, cache);
			} catch (error) {
				failures.push({
					index: i,
					event_id: dtos[i].id,
					reason:
						error instanceof HttpException ? error.message : String(error),
				});
			}
		}
		if (failures.length > 0) {
			throw new UnprocessableEntityException({
				message: 'Batch rejected; no events were stored',
				failures,
			});
		}

		// start ingesting events
		const results: IngestResult[] = [];
		for (let i = 0; i < dtos.length; i++) {
			results.push(await this.store(raws[i], dtos[i], resourceIds[i]));
		}
		const stored = results.filter((r) => r.stored).length;
		return {
			received: results.length,
			stored,
			duplicates: results.length - stored,
			events: results,
		};
	}

	/**
	 * Verify the correctness of the source and that the user is allowed to submit events for the resource linked to the source
	 */
	private async authorize(
		dto: TrackerEventDto,
		user: User,
		cache: Map<string, string | null>,
	): Promise<string> {
		const match = GITHUB_SOURCE.exec(dto.source);
		if (!match) {
			throw new BadRequestException(`Unsupported source "${dto.source}"`);
		}

		if (!cache.has(dto.source)) {
			const linked = await this.sources.findBySource(
				SourceSystem.GITHUB,
				match[1],
			);
			cache.set(dto.source, linked?.resource_id ?? null);
		}
		const resourceId = cache.get(dto.source);
		if (!resourceId) {
			throw new UnprocessableEntityException(
				`No resource is linked to source "${dto.source}"`,
			);
		}
		assertUserManagesResource(user, resourceId);
		return resourceId;
	}

	// Event payload is saved from the raw event to avoid the DTO validation changing the payload
	private async store(
		raw: RawEvent,
		dto: TrackerEventDto,
		resourceId: string,
	): Promise<IngestResult> {
		const { stored, id } = await this.events.save({
			event_id: dto.id,
			source: dto.source,
			type: dto.type,
			subject: dto.subject,
			time: new Date(dto.time),
			dataschema: dto.dataschema,
			resource_id: resourceId,
			payload: raw,
		});
		return { event_id: dto.id, id, stored };
	}
}
