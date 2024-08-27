import { applyDecorators, SetMetadata } from '@nestjs/common';

export const AGGREGATOR_METADATA = 'AGGREGATOR';

export const AggregatorClass = (options: any = {}) => {
	return applyDecorators(SetMetadata(AGGREGATOR_METADATA, options));
};
