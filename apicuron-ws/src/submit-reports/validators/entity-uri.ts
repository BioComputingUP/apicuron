import { ConfigService } from '@nestjs/config';
import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	isURL,
	validate,
} from 'class-validator';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { Injectable, NotFoundException } from '@nestjs/common';

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

		// a missing or unknown resource_id is reported by the resource_id validation,
		// the host of the entity_uri can only be checked against an existing resource
		if (!resource_id) {
			return true;
		}
		const resource = await this.resourcesService
			.get_resource(resource_id)
			.catch((err) => {
				if (err instanceof NotFoundException) {
					return null;
				}
				throw err;
			});

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
