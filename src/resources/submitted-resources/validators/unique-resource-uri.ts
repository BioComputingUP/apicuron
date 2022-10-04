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
import { SubmittedResource } from '../../schemas/submitted-resource.schema';


// create custom validator according to class-validator standards
// marking the class as injectable to add it to nestjs DI
@Injectable()
@ValidatorConstraint({ name: 'UniqueResourceURI', async: true })
export class UniqueResourceURIRule implements ValidatorConstraintInterface {

	// the class does not populate the SubmittedResourcesService for some reason
	// The mongodb connection is used to overcome that issue
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private logger = new Logger(UniqueResourceURIRule.name);

	async validate(value: string) {
		try {
			return ! await this.connection.models[SubmittedResource.name].exists({ resource_uri: value })
		} catch (e) {
			this.logger.error(
				'Error at the UniqueResourceURIRule validator',
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
