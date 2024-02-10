import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import {
	Injectable,
	Logger,
	InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { InjectModel } from '@nestjs/mongoose';

/**
 * @description This validator checks of the activity term already exists in the database
 * hte behavior can be reversed by passing [true] as a second parameter (first constraint to true)
 * and the validator would only be valid if the activity_term doesn't already exist for the resource
 * Requires "resource_id" on the arguments object
 */

@Injectable()
@ValidatorConstraint({ name: 'ActivityTermExists', async: true })
export class ActivityTermExists implements ValidatorConstraintInterface {
	exists_list;

	constructor(@InjectModel(Term.name) private termModel: Model<TermDocument>) {}

	private logger = new Logger(ActivityTermExists.name);

	async validate(value: string | Array<string>, args: ValidationArguments) {
		// the second parameter is responsible for reversing the validator
		// when the first parameter of the validator constraint is true, the Activity term
		// is only valid when the ActivityTerm doesn't exist in the database
		const resource_id = args.object['resource_id'];
		let exists;
		try {
			if (
				args.constraints &&
				args.constraints.find((x) => x.each == true) &&
				typeof value == 'object'
			) {
				// value expected is an array of terms
				const terms: Array<string> = value;

				// we check if each term exists in the database
				const exists_promises = terms.map(async (term) => {
					return this.termModel.exists({ activity_term: term, resource_id });
				});
				// await for the asynchronous call simultaneously and convert it to a boolean
				// store this as a class attribute to use it in the default message
				this.exists_list = await Promise.all(exists_promises);

				// the validator is valid if they are all valid
				exists = this.exists_list.every(Boolean);
			} else {
				// value expected is s single term, we check if it exists
				exists = !!(await this.termModel.exists({
					activity_term: value,
					resource_id,
				}));
			}

			// if the behavior of the validator is reversed (aka the activity term shoud not exist)
			// the output is reversed
			if (args.constraints && args.constraints.find((x) => x.reverse == true)) {
				return !exists;
			} else {
				return exists;
			}
		} catch (e) {
			console.error('Error at the ActivityTermExists validator', e.stack, e);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	defaultMessage(args?: ValidationArguments): string {
		// handle the reverse case and edit message accordingly
		let error_snippet = 'does not exist';
		if (args.constraints && args.constraints.find((x) => x.reverse == true)) {
			error_snippet = 'Already exists';
		}

		// handle the array of terms case and edit message accordingly
		let value;
		if (
			args.constraints &&
			args.constraints.find((x) => x.each == true) &&
			Array.isArray(args.value)
		) {
			// if the value received is an array
			// filter the array and only obtain the invalid terms
			const invalid_terms = args.value.filter(
				(val, index) => !this.exists_list[index],
			);
			value = invalid_terms.join(',');
		} else {
			value = args.value;
		}

		return `Activity Term (${value}) ${error_snippet} on resource ${args.object['resource_id']}`;
	}
}
