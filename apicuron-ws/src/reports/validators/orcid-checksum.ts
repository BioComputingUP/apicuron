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
import { InjectModel } from '@nestjs/mongoose';
/**
 * @description Validated the ORCID-ID checksum according to the standard
 * here https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier
 */
@Injectable()
@ValidatorConstraint({ name: 'OrcidChecksum', async: true })
export class OrcidChecksum implements ValidatorConstraintInterface {
	private logger = new Logger(OrcidChecksum.name);


	async validate(orcid_id: string, args: ValidationArguments) {
		try {
			const orcid_digits = orcid_id.split('').filter((char) => char != '-');
			const [digits, checksum]: [number[], string] = [
				orcid_digits.slice(0, -1).map((x) => parseInt(x)),
				orcid_digits.slice(-1)[0],
			];

			// let sum = 0;
			// for (let i = 0; i < digits.length; i++) {
			// 	sum = (sum + digits[i]) * 2
			// }
			let sum = digits.reduce((prev, curr) => (prev + curr) * 2, 0);

			let check_value: number = (12 - (sum % 11)) %  11;
			const check: string = check_value == 10 ? 'X' : String(check_value);
			return check == checksum

		} catch (e) {
			console.error('Error at the OrcidChecksum validator', e.stack, e);
			throw new InternalServerErrorException('Internal Server Error');
		}
	}

	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'Failed Orcid Checksum validation on ($value)';
	}
}
