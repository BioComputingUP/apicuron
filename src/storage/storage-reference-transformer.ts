import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import {
	applyDecorators,
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { InjectTransformer, InjectTransform } from 'nestjs-inject-transformer';
import { StorageType } from './storage.config';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class StorageReferenceInterceptor implements NestInterceptor {
	private readonly storageService: StorageService;

	constructor(storageService: StorageService) {
		this.storageService = storageService;
	}
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		return next.handle();
	}

	// async transform({ value: reference }: TransformFnParams): Promise<string> {
	// 	console.log(reference);
	// 	const canonicalUrl = this.storageService
	// 		.getEngine(StorageType.public)
	// 		.buildCanonicalUrl(reference.replace('/public', ''));
	// 	console.log({ value: reference, canonicalUrl });
	// 	return await this.storageService.getPublicUrl(canonicalUrl);
	// }
}

// export const StorageReference = () =>
// 	applyDecorators(InjectTransform(StorageReferenceTransformer), Reflect.metadata('storageReference', true)
// 	);

export const StorageReference =
	(): PropertyDecorator => (target, propertyKey) => {
		const getter = () => {
			return target[propertyKey];
		};
		const setter = (value) => {
			target[propertyKey] = value;
		};
		Object.defineProperty(target, propertyKey, {
			get: getter,
			set: setter,
			enumerable: true,
			configurable: true,
		});
		Reflect.defineMetadata(
			'storageReference',
			{
				propertyKey,
				getter,
				setter,
			},
			target,
			propertyKey,
		);
	};
