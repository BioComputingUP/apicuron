import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from '@nestjs/common';
import { Observable, switchMap, of, from, map, tap } from 'rxjs';
import { StorageType } from '../../storage/storage.config';
import { StorageReferenceMetadataKey } from '../decorators/storage-reference.decorator';

@Injectable()
export class StorageReferenceInterceptor implements NestInterceptor {
	private readonly storageService: StorageService;

	logger = new Logger(StorageReferenceInterceptor.name);

	constructor(storageService: StorageService) {
		this.storageService = storageService;
	}
	async processStorageReference(value: string): Promise<string> {
		const url = await this.storageService.getPublicUrl(value);
		// this.logger.debug(`Processed storage reference ${value} to ${url}`);
		return url;
	}

	async checkStorageReference(obj: unknown): Promise<unknown> {
		if (obj == null || typeof obj !== 'object') {
			return obj;
		}
		if (Array.isArray(obj)) {
			const promises = obj.map((item) => this.checkStorageReference(item));
			return await Promise.all(promises);
		}
		for (const [key, value] of Object.entries(obj) as [string, unknown][]) {
			if (key.startsWith('_')) {
				this.logger.debug(`Ignoring private key ${key}`);
				continue;
			}
			// If metadata exists, run the processing function
			const metadata = Reflect.getMetadata(
				StorageReferenceMetadataKey,
				obj,
				key,
			);
			if (metadata && typeof value === 'string') {
				this.logger.debug(`found key ${key}`);
				const currObj = obj as { [k: string]: string };
				currObj[key] = await this.processStorageReference(currObj[key]);
				// if the value is a string and it's processed, there's no more recurive checks to perform on this value
				continue;
			}
			if(key == 'logo') {
				this.logger.debug(`Checked Key ${key} is not a storage reference`);
				this.logger.debug(`Metadata is ${!!metadata}`);
				this.logger.debug(`typeof value is ${typeof value} and value is ${value}`);
			}

			// Recursively process nested objects or arrays
			obj[key] = await this.checkStorageReference(value);
		}
		return obj;
	}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		return next.handle().pipe(
			switchMap((data: unknown) => {
				// if the data is a simple Pojo, return it as-is skip checks
				if (!!data && Object.getPrototypeOf(data) == null) {
					this.logger.log('skipping checks');
					return of(data);
				}
				this.logger.log('checking storage references');
				return from(this.checkStorageReference(data));
			}),
		);
	}
}
