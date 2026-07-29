import {
	Body,
	Controller,
	HttpException,
	InternalServerErrorException,
	Logger,
	Post,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { VersionHeader } from 'src/plugins/swagger/config';
import { PRPayloadDto } from './dto/pr_payload.dto';
import { PrContributionProcessor } from './processors/pr_closed.processor';

@ApiTags('Software')
@ApiHeader(VersionHeader)
@Controller({ path: 'software', version: '2' })
export class SoftwareController {
	private readonly logger = new Logger(SoftwareController.name);
	constructor(private readonly pr_processor: PrContributionProcessor) {}

	@Post('/pull_requests')
	async handlePRPayload(@Body() payload: PRPayloadDto) {
		try {
			await this.pr_processor.process(payload);
		} catch (error) {
			this.logger.error(
				`handlePRPayload failed for payload ${JSON.stringify(
					payload,
				)}: ${error}`,
			);
			if (error instanceof HttpException) throw error;
			else throw new InternalServerErrorException(error.message);
		}
		return { message: 'ok' };
	}
}
