import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { VersionHeader } from 'src/plugins/swagger/config';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { User } from '../core/schemas/user.schema';
import { TrackerEventBatchDto, TrackerEventDto } from './dto/tracker-event.dto';
import { TrackerEventsIngestService } from './services/tracker-events-ingest.service';

type AuthenticatedRequest = Request & { user: User };

@ApiTags('Tracker events')
@ApiHeader(VersionHeader)
@Controller({ path: 'tracker-events', version: '2' })
@UseGuards(LocalAuthGuard, HasAResourceGuard)
export class TrackerEventsController {
	constructor(private readonly ingestService: TrackerEventsIngestService) {}

	@Post()
	@HttpCode(HttpStatus.ACCEPTED)
	async receive(@Body() dto: TrackerEventDto, @Req() req: AuthenticatedRequest) {
		// dto: validated copy; req.body: raw payload, stored unchanged
		return this.ingestService.ingest(req.body as Record<string, unknown>, dto, req.user);
	}

	@Post('batch')
	@HttpCode(HttpStatus.ACCEPTED)
	async receiveBatch(@Body() dto: TrackerEventBatchDto, @Req() req: AuthenticatedRequest) {
		const raws = (req.body as { events: Record<string, unknown>[] }).events;
		return this.ingestService.ingestBatch(raws, dto.events, req.user);
	}
}