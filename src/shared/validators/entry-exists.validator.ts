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
import { getConnectionToken, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// create custom validator according to class-validator standards
// marking the class as injectable to add it to nestjs DI
/**
 * @class
 * @param {model_name} string
 * @param {filter_builder} function
 *
 * @description This Validator checks if an entry exists for a model
 * 	It requires the two properties in the constraints array, the model_name
 * 	under which is it registered on Mongoose and a function that returns the
 * 	mongodb filter object when the validated object is supplied as a parameter
 */
@ValidatorConstraint({ name: 'EntryExistsRule', async: true })
@Injectable()
export class EntryExistsRule implements ValidatorConstraintInterface {
	// the class does not populate the SubmittedResourcesService for some reason
	// The mongodb connection is used to overcome that issue
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private logger = new Logger(EntryExistsRule.name);

	async validate(value: string, args: ValidationArguments) {
		const [model_name, filter_builder] = args.constraints;
		try {
			return !!(await this.connection.models[model_name].exists(
				filter_builder(args.object),
			));
		} catch (e) {
			this.logger.error('Error at the EntryExistsRule validator', e.stack, e);
			// throw new InternalServerErrorException('Internal Server Error');
			return false;
		}
	}

	defaultMessage({ property, value }: ValidationArguments) {
		return `The ${property} "${value}" Does not exist`;
	}
}

// This is a validation class for an array of entries
@ValidatorConstraint({ name: 'EntriesExistsRule', async: true })
@Injectable()
export class EntriesExistRule implements ValidatorConstraintInterface {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	private logger = new Logger(EntriesExistRule.name);

	async validate(values: string[], args: ValidationArguments) {
		const [model_name, filter_builder] = args.constraints;
		try {
			// construct initial validation object;
			const validationObject = { ...args.object };

			// for each value in the Array we swap the targetName of the property with a single value from the Array
			const checks$: Promise<boolean>[] = values.map(async (value: string) => {
				validationObject[args.property] = value;
				// we run the filter_builder function on the validationObject with the swapped values;
				return !!(await this.connection.models[model_name].exists(
					filter_builder(validationObject),
				));
			});
			// after awaiting all the promises
			const checks = await Promise.all(checks$);

			// if any entry is false, validation fails
			return !checks.includes(false);
		} catch (e) {
			this.logger.error('Error at the EntriesExistsRule validator', e.stack, e);
			return false;
		}
	}

	defaultMessage({ property, value }: ValidationArguments) {
		return `One of the properties of ${property}. with the value: ${value.join(
			', ',
		)} Does not exist`;
	}
}
