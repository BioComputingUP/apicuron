import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { Logger, InternalServerErrorException } from '@nestjs/common';
/**
 * @description Validated the ORCID-ID checksum according to the standard
 * here https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier
 */
@ValidatorConstraint({ name: 'OrcidChecksum', async: true })
export class OrcidChecksum implements ValidatorConstraintInterface {
	private logger = new Logger(OrcidChecksum.name);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async validate(orcid_id: string, args: ValidationArguments) {
		// first we verify that the length of the orcid id is correct
		if (orcid_id.split('-').join('').length != 16) {
			return false;
		}

		try {
			// obtain the individual digits of the orcid id in an array (split by dash. regroup and then split entire string)
			const orcid_digits: string[] = orcid_id.split('-').join('').split('');
			const [digits, checksum]: [number[], string] = [
				orcid_digits.slice(0, -1).map((x) => parseInt(x)),
				orcid_digits.slice(-1)[0],
			];
			const sum = digits.reduce((prev, curr) => (prev + curr) * 2, 0);

			const check_value: number = (12 - (sum % 11)) % 11;
			const check: string = check_value == 10 ? 'X' : String(check_value);
			return check == checksum;
		} catch (e) {
			this.logger.error('Error at the OrcidChecksum validator', e.stack, e);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'Failed Orcid Checksum validation on ($value)';
	}
}
