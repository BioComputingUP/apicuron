import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { VersionHeader } from 'src/plugins/swagger/config';

@ApiTags('Software')
@ApiHeader(VersionHeader)
@Controller({ path: 'software', version: '2' })
export class SoftwareController {
	@Post('/pull_requests')
	handlePRPayload(@Body() payload: unknown) {
		console.log(payload);
		return { message: 'ok' };
	}
}
