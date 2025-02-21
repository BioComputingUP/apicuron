import {
	ClassSerializerInterceptor,
	NestInterceptor,
	Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TransformInterceptor } from '../transformer/transform.interceptor';
import { StorageReferenceInterceptor } from './storage-reference.interceptor';
import { tap } from 'rxjs';

export function getGlobalInterceptorChain(): Provider<NestInterceptor>[] {
	return [
		{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
		{
			provide: APP_INTERCEPTOR,
			inject: [Reflector],
			useFactory: (reflect: Reflector) => {
				class ProxyClassSerializerInterceptor extends ClassSerializerInterceptor {
					intercept(context: any, next: any) {
						// console.log(ClassSerializerInterceptor.name);
						return super
							.intercept(context, next)
							.pipe(tap((x) => console.log(ClassSerializerInterceptor.name)));
					}
				}

				return new ProxyClassSerializerInterceptor(reflect, {
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
