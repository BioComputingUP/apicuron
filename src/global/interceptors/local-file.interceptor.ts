import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';

interface LocalFilesInterceptorOptions {
	path?: string;
	public?: Boolean
}

function LocalFilesInterceptor(
    fieldName: string,
	options: LocalFilesInterceptorOptions,
): Type<NestInterceptor> {
	@Injectable()
	class Interceptor implements NestInterceptor {
		fileInterceptor: NestInterceptor;
		constructor(configService: ConfigService) {
			
            // if the file is public, by default it's stored where it's served automatically
            // if the file is not public it's stored on a different path
            const filesDestination = options.public
				? configService.get('PUBLIC_FILES_PATH')
				: configService.get('UPLOADED_FILES_DESTINATION');
            

			const destination = join(filesDestination, options.path)

			const multerOptions: MulterOptions = {
				storage: diskStorage({
					destination,
				}),
			};

			this.fileInterceptor = new (FileInterceptor(
				fieldName,
				multerOptions,
			))();
		}

		intercept(...args: Parameters<NestInterceptor['intercept']>) {
			return this.fileInterceptor.intercept(...args);
		}
	}
	return mixin(Interceptor);
}

export default LocalFilesInterceptor;
