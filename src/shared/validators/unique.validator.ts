import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	Inject,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// create custom validator according to class-validator standards
// marking the class as injectable to add it to nestjs DI
/**
 * @class
 * @param {string} model_name
 * @param {function(object):object} filter_builder
 *
 * @description This Validator checks if an attribute is unique for a model
 * 	It requires the two properties in the constraints array, the model_name
 * 	under which is it registered on Mongoose and a function that returns the
 * 	filter object when the value is supplied as a parameter
 */
@Injectable()
@ValidatorConstraint({ name: 'UniqueResourceId', async: true })
export class UniqueRule implements ValidatorConstraintInterface {
	// the class does not populate the SubmittedResourcesService for some reason
	// The mongodb connection is used to overcome that issue
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private logger = new Logger(UniqueRule.name);

	async validate(value: string, args: ValidationArguments) {
		const [model_name, filter_builder] = args.constraints;
		try {
			return !(await this.connection.models[model_name].exists(
				filter_builder(args.object),
			));
		} catch (e) {
			this.logger.error('Error at the UniqueRule validator', e.stack, e);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	defaultMessage({ property, value }: ValidationArguments) {
		return `The ${property} "${value}" Already taken`;
	}
}
