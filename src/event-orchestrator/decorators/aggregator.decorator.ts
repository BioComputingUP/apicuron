import { applyDecorators, SetMetadata } from '@nestjs/common';
import { AggregatorOptions } from '../interfaces/aggregator.interface';

export const AGGREGATOR_METADATA = 'AGGREGATOR';

export const AggregatorClass = (options: AggregatorOptions = {}) => {
	return applyDecorators(SetMetadata(AGGREGATOR_METADATA, options));
};
