import { ConfigService } from '@nestjs/config';
import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	isURL,
	validate,
} from 'class-validator';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'isBefore', async: false })
@Injectable()
export class EntityUriValid implements ValidatorConstraintInterface {
	constructor(
		protected resourcesService: PartnerResourcesService,
		protected config: ConfigService,
	) {}

	async validate(propertyValue: string, args: ValidationArguments) {
		const [resourceIdFactory] = args.constraints;

		const resource_id: string = resourceIdFactory(args.object);

		const resource = await this.resourcesService.get_resource(resource_id);

		if (resource) {
			const host_whitelist: string[] = resource.allowedUrlsPrefix
				.concat([resource.resource_uri, resource.resource_url])
				.map((url: string) => new URL(url).host);

			return isURL(propertyValue, {
				protocols:
					this.config.get('environment') == 'prodution'
						? ['https']
						: ['http', 'https'],
				host_whitelist,
				require_host: true,
				require_protocol: true,
				require_valid_protocol: true,
			});
		} else {
			return true;
		}
	}

	defaultMessage({ constraints, object, property }: ValidationArguments) {
		const resId = constraints[0](object);
		return `"${property}" must share the same host as the resource "${resId}"`;
	}
}
