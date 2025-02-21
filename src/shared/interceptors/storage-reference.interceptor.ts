import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable, switchMap, of, from, map } from 'rxjs';
import { StorageType } from '../../storage/storage.config';
import { StorageReferenceMetadataKey } from '../decorators/storage-reference.decorator';

@Injectable()
export class StorageReferenceInterceptor implements NestInterceptor {
	private readonly storageService: StorageService;

	constructor(storageService: StorageService) {
		this.storageService = storageService;
	}
	async processStorageReference(value: string): Promise<string> {
		return await this.storageService
			.getEngine(StorageType.public)
			.getUrl(value);
	}

	async checkStorageReference(obj: unknown): Promise<unknown> {
		if (obj == null || typeof obj !== 'object') {
			return obj;
		}
		if (Array.isArray(obj)) {
			return obj.map((item) => this.checkStorageReference(item));
		}
		for (const [key, value] of Object.entries(obj) as [string, unknown][]) {
			if (key.startsWith('_')) {
				console.warn(`Ignoring private key ${key}`);
				continue;
			}
			// If metadata exists, run the processing function
			const metadata = Reflect.getMetadata(
				StorageReferenceMetadataKey,
				obj,
				key,
			);
			if (metadata && typeof value === 'string') {
				console.log(`found key ${key}`);
				const currObj = obj as { [k: string]: string };
				currObj[key] = await this.processStorageReference(currObj[key]);
				// if the value is a string and it's processed, there's no more recurive checks to perform on this value
				continue;
			}

			// Recursively process nested objects or arrays
			this.checkStorageReference(value);
		}
		return obj;
	}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		return next.handle().pipe(
			switchMap((data: unknown) => {
				// if the data is a simple Pojo, return it as is/ skip checks
				console.log(StorageReferenceInterceptor.name);
				if (Object.getPrototypeOf(data) == null) {
					console.log('skipping checks');
					return of(data);
				}
				console.log('checking storage references');
				return from(this.checkStorageReference(data)).pipe(map(() => data));
			}),
		);
	}
}
