import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ResourceManagerGuard } from '../guards/resource-manager-only.guard';
import { ResourceIdKey, ResourceIdPlace } from '../constants';

export function OnlyResourceManagers(
	options: {
		resourceKey: string;
		keyPlacement: 'params' | 'body' | 'query';
	} = { resourceKey: 'resource_id', keyPlacement: 'params' },
) {
	return applyDecorators(
		SetMetadata(ResourceIdKey, options.resourceKey),
		SetMetadata(ResourceIdPlace, options.keyPlacement),
		UseGuards(ResourceManagerGuard),
	);
}
