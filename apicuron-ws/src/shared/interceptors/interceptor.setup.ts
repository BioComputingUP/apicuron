import {
	ClassSerializerInterceptor,
	NestInterceptor,
	Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TransformInterceptor } from '../transformer/transform.interceptor';
import { StorageReferenceInterceptor } from './storage-reference.interceptor';

export function getGlobalInterceptorChain(): Provider<NestInterceptor>[] {
	return [
		{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
		{
			provide: APP_INTERCEPTOR,
			inject: [Reflector],
			useFactory: (reflect: Reflector) => {
				return new ClassSerializerInterceptor(reflect, {
					enableCircularCheck: true,
					excludeExtraneousValues: true,
				});
			},
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: StorageReferenceInterceptor,
		},
	];
}
