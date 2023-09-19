import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	Inject
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SubmittedResource } from '../../core/schemas/resource.schema';


// create custom validator according to class-validator standards
// marking the class as injectable to add it to nestjs DI
@Injectable()
@ValidatorConstraint({ name: 'UniqueResourceId', async: true })
export class UniqueResourceIdRule implements ValidatorConstraintInterface {

	// the class does not populate the SubmittedResourcesService for some reason
	// The mongodb connection is used to overcome that issue
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private logger = new Logger(UniqueResourceIdRule.name);

	async validate(value: string) {
		try {
			return ! await this.connection.models[SubmittedResource.name].exists({ resource_id: value })
		} catch (e) {
			this.logger.error(
				'Error at the UniqueResourceIdRule validator',
				e.stack,
				e,
			);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	defaultMessage(args: ValidationArguments) {
		return `ResourceId "${args.value}" Already taken`;
	}
}
