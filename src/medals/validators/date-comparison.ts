import {
	isDateString,
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

/**
 *
 * @param properties Property to validate
 * @param validationOptions Validation Options
 * @returns Validator
 * @Description This validator compares this field to the keys supplied in the constraints
 * Makes sure that the current field's Date has a "bigger" date than the dates at the mentionned keys
 */
export function MinDateField(
	properties: string[],
	skipIfNull = false,
	validationOptions?: ValidationOptions,
) {
	return (object: any, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [
				{ properties },
				{ operator: 'min', skipIfNullOption: skipIfNull },
			],
			validator: DateFieldComparison,
		});
	};
}

export function MaxDateField(
	properties: string[],
	skipIfNull = false,
	validationOptions?: ValidationOptions,
) {
	return (object: any, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [
				{ properties },
				{ operator: 'max', skipIfNullOption: skipIfNull },
			],
			validator: DateFieldComparison,
		});
	};
}

@ValidatorConstraint({ name: 'DateFieldComparison' })
export class DateFieldComparison implements ValidatorConstraintInterface {
	dates_validation: Array<boolean | undefined> = [];

	validate(value: string, args: ValidationArguments) {
		if (!value) {
			return true;
		}
		const current_field = new Date(value);
		// get the properties from the constraints array and make sure it's an array of strings
		const { properties }: { properties: string[] } = args.constraints.find(
			(x) => x.properties && Array.isArray(x.properties),
		);

		// get the operator specified in the constraints array by the decorator registration
		const {
			operator,
			skipIfNullOption,
		}: { operator: 'min' | 'max'; skipIfNullOption: boolean } =
			args.constraints.find(
				(x) => !!x.operator && (x.operator == 'min' || x.operator == 'max'),
			);

		const skipIfNull = !!skipIfNullOption || false;

		// for each property passed
		this.dates_validation = properties.map((property_name) => {
			if (
				skipIfNull &&
				(!args.object[property_name] ||
					typeof args.object[property_name] == 'string' ||
					!isDateString(args.object[property_name]))
			) {
				return true;
			}
			// intantiate the date from the validation object
			const compared_date = new Date(args.object[property_name]);
			// if the operator is 'min' (meaning we're setting the min values for the current field)
			// we make sure the current field is bigger than the compared_date
			if (operator == 'min') {
				return current_field.getTime() > compared_date.getTime();
			}
			// if the operator is 'max' (meaning we're setting the max values for the current field)
			// we make sure the current field is smaller than the compared_date
			if (operator == 'max') {
				return current_field.getTime() < compared_date.getTime();
			}
		});
		return this.dates_validation.every(Boolean);
	}

	defaultMessage(args?: ValidationArguments): string {
		const { properties }: { properties: string[] } = args?.constraints.find(
			(x) => x.properties && Array.isArray(x.properties),
		);
		const { operator }: { operator: 'min' | 'max' } = args?.constraints.find(
			(x) => x.operator && (x.operator == 'min' || x.operator == 'max'),
		);

		const invalid_properties = properties.filter(
			(value, index) => !this.dates_validation[index],
		);

		const error_snippet = operator == 'min' ? 'bigger' : 'smaller';

		return `${args?.property} Date should be ${error_snippet} than ${invalid_properties} `;
	}
}
