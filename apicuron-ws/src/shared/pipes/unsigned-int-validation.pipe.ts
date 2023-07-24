import {
	PipeTransform,
	Injectable,
	ArgumentMetadata,
	BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseUnsignedIntPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		if (value) {
			if (
				metadata.metatype != undefined ||
				value.metatype == String ||
				value.metatype == Number
			) {
				const parsedInt = parseInt(value);

				if (parsedInt >= 0 && parsedInt % 1 == 0) {
					return parsedInt;
				} else {
					throw new BadRequestException(
						'Validation Error: numeric string received is either < 1 or is a float',
						metadata.data
					);
				}
			}

			throw new BadRequestException(
				`Validation Error: numeric string is expected`,
				metadata.data,
			);
		}
	}
}
