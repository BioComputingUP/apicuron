import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { default as isSlugFunc } from 'validator/lib/isSlug';

export function isSlug(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object: any, propertyName: string) => {
		registerDecorator({
			name: 'isSlug',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsSlugValidator,
		});
	};
}

@ValidatorConstraint({ name: 'isSlug', async: false })
export class IsSlugValidator implements ValidatorConstraintInterface {
	validate(value: any): Promise<boolean> | boolean {
		return isSlugFunc(value);
	}
	defaultMessage?(validationArguments?: ValidationArguments): string {
		return `The ${validationArguments?.property} "${validationArguments?.value}" is not a valid slug`;
	}
}
