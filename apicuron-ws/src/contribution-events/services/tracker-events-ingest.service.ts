import { BadRequestException, ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User } from '@sentry/node';
import { SourceSystem } from 'src/core/schemas/components/resource-source.schema';
import { TrackerEventDto } from '../dto/tracker-event.dto';
import { ContributionEventsRepository } from '../repository/contribution-events.repository';
import { ResourceSourceRepository } from '../repository/resource-source.repository';
import { IngestResult } from '../types/types';

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

		const managesResource = (user.resources ?? []).some(
			(r) => r.resource_id === resourceId,
		);
		if (!managesResource) {
			throw new ForbiddenException(
				`Not allowed to submit events for resource "${resourceId}"`,
			);
		}
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
