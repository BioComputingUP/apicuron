import { Module } from '@nestjs/common';
import { SubmitOrcidWork } from './submit-orcid.service';
import { ConfigService } from '@nestjs/config';
import { DefaultWorkBuilder } from './work-builders/default.work-builder';
import { OrcidWorkBuilderToken } from './constants';
import { OrcidClientModule } from '../../orcid/orcid-client/orcid-client.module';
import { CoreApicuronModule } from '../../core/core.module';

@Module({
	imports: [CoreApicuronModule, OrcidClientModule],
	controllers: [],
	providers: [
		{
			inject: [ConfigService],
			provide: OrcidWorkBuilderToken,
			useFactory(config: ConfigService) {
				return new DefaultWorkBuilder(config);
			},
		},
		SubmitOrcidWork,
	],
})
export class OrcidSubmissionModule {}
