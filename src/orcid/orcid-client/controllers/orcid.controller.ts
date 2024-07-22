import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthProtected } from '../../../auth/decorators/auth.decorator';
import { OrcidClientService } from '../orcid-client.service';
import { Response } from 'express';

@Controller({
	path: '/orcid',
})
export class OrcidAPIController {
	constructor(protected client: OrcidClientService) {}

	@AuthProtected()
	@Get('search')
	async search(@Query('query') query: string, @Res() response: Response) {
		const searchText = `given-and-family-names:${query} OR credit-name:${query}`;
		const orcidResponse = await this.client.expandedSearch(searchText);
		response.status(orcidResponse.status).send(orcidResponse.data);
	}
}
