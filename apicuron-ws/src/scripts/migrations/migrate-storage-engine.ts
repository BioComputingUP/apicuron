import { Engine, LocalFsEngine } from "@biocomputingup/nest-storage-manager";
import { StorageService } from "@biocomputingup/nest-storage-manager";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { join } from "node:path";
import { AppModule } from "src/app.module";
import { PartnerResource, PartnerResourceDocument, Resource, User, UserDocument } from "src/core/schemas";
import { StorageType } from "src/storage/storage.config";

async function bootstrap() {

	const app = await NestFactory.createApplicationContext(AppModule);
	await app.init();

	const config: ConfigService = app.get(ConfigService);


	// const minioConfig = {
	// 	endpoint: 'http://pleiadi:9000',
	// 	region: 'test-region-1',
	// 	credentials: {
	// 		accessKeyId: 'Jio6AVk2awE1nfAAiPaW',
	// 		secretAccessKey: '***REMOVED***',
	// 	},
	// 	forcePathStyle: true,
	// };
	// const privateBucketConfig = {
	// 	bucket: 'apicuron-production-private',
	// 	proxy: {
	// 		proxyEndpoint: 'http://pleiadi:9000/apicuron-production-private',
	// 		proxyBucket: 'http://localhost:3000/storage/apicuron-production-private',
	// 	},
	// };

	// const publicBucketConfig = {
	// 	bucket: 'apicuron-production-public',
	// 	proxy: {
	// 		proxyEndpoint: 'http://pleiadi:9000/apicuron-production-public',
	// 		proxyBucket: 'http://localhost:3000/storage/apicuron-production-public',
	// 	},
	// };

	const oldPrivatePath = config.get('PRIVATE_FILES_PATH');
	const oldPublicPath = config.get('PUBLIC_FILES_PATH');
	const storageService: StorageService = await app.get(StorageService);

	// const oldPrivateEngine = new Engine(new LocalFsEngine({
	// 	folderPath: oldPrivatePath,
	// 	baseUrl: 'http://localhost:3000/api/storage/private'
	// }), 'oldPrivate');
	// await storageService.register('oldPrivate', oldPrivateEngine);



	const oldPublicEngine = new Engine(new LocalFsEngine({
		folderPath: oldPublicPath,
		baseUrl: 'http://localhost:3000/api/storage/private'
	}), 'oldPublic');


	await storageService.register('oldPublic', oldPublicEngine);


	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));
	const resourceModel: Model<PartnerResourceDocument> = app.get(getModelToken(PartnerResource.name));

	const pathUpdaterFactory = (engine: string) => {
		const pathUpdater = async (sourceUrl: string, targetUrl: string) => {
			const { path } = storageService.parseCanonicalUrl(sourceUrl);

			const oldPath = join(engine, path)
	
			console.log(`Updating files with path ${oldPath}`);
	
			const result = await userModel.updateMany({ avatar: oldPath }, { $set: { avatar: targetUrl } });
			console.debug(`Updated ${result.modifiedCount} Entries in userModel`);
			const result2 = await resourceModel.updateMany({ logo: oldPath }, { $set: { logo: targetUrl } });
			console.debug(`Updated ${result.modifiedCount} Entries in resourceModel`);
	
		}
		return async(...args) => {};
	}


	// await storageService.migrateAll('oldPrivate', StorageType.private, pathUpdaterFactory('private'), { maxConcurrency: 0, deleteFromSource: false });
	await storageService.migrateAll('oldPublic', StorageType.public, pathUpdaterFactory('public'), { maxConcurrency: 0, deleteFromSource: false})






	await app.close();

}


bootstrap();