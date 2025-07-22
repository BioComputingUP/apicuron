import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
/**
 * @description Validated the ORCID-ID checksum according to the standard
 * here https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier
 */
@ValidatorConstraint({ name: 'OrcidChecksum', async: true })
export class LeagueValidator implements ValidatorConstraintInterface {
	constructor(protected resourcesService: PartnerResourcesService) {}
	private logger = new Logger(LeagueValidator.name);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async validate(league: string, args: ValidationArguments) {
		const { resource_id, curator_orcid } = args.object as unknown as any;
		if (!resource_id) {
			return false;
		}

		const resource = await this.resourcesService.get_resource(resource_id);

		if (!league && !!curator_orcid) {
			const league = await this.resourcesService.getUserLeague(
				resource,
				curator_orcid,
			);
			args.object[args.property] = league;
			return true;
		}

		const resourceLeagues = (
			await this.resourcesService.get_resource(resource_id)
		).leagues;
		if (resourceLeagues.some((l) => l.name === league)) {
			return true;
		}
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'league ($value) does not exist';
	}
}
