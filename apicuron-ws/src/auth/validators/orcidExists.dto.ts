import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../../core/repositories/user.repository';

@ValidatorConstraint({ name: 'OrcidExists', async: true })
export class OrcidExists implements ValidatorConstraintInterface {
	constructor(protected userModel: UserRepository) {}

	async validate(
		orcid_id: string,
		_validationArguments?: ValidationArguments,
	): Promise<boolean> {
		return !!(await this.userModel.findOne({ orcid_id }));
	}

	defaultMessage(args?: ValidationArguments): string {
		return `orcid ID (${args?.value}) does not exist`;
	}
}
