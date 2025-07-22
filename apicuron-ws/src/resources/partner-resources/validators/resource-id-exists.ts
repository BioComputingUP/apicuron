import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../core/schemas/resource/partner-resource.schema';

// create custom validator according to class-validator standards
// marking the class as injectable to add it to nestjs DI
/**
 * @description Valdiator that checks if the resource_id exists in the database
 */
@Injectable()
@ValidatorConstraint({ name: 'ResourceIdExists', async: true })
export class ResourceIdExists implements ValidatorConstraintInterface {
	// the class does not populate the SubmittedResourcesService for some reason
	// The mongodb connection is used to overcome that issue
	constructor(
		@InjectModel(PartnerResource.name)
		private readonly partnerResourceModel: Model<PartnerResourceDocument>,
	) {}

	private logger = new Logger(ResourceIdExists.name);

	async validate(value: string) {
		if (!value) {
			return true;
		}
		try {
			return !!(await this.partnerResourceModel.exists({ resource_id: value }));
		} catch (e) {
			this.logger.error(
				'Error at the ResourceIdExistsRule validator',
				e.stack,
				e,
			);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	defaultMessage(args: ValidationArguments) {
		return `ResourceId "${args.value}" Does not exist`;
	}
}
