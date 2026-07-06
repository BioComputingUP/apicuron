import { StorageService } from "@biocomputingup/nest-storage-manager";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AppModule } from "src/app.module";
import { PartnerResource, User } from "src/core/schemas";


async function bootstrap() {

	const app = await NestFactory.createApplicationContext(AppModule);

	const storage: StorageService = app.get(StorageService);
	const resourceModel: Model<PartnerResource> = app.get(getModelToken(PartnerResource.name));
	const userModel: Model<User> = app.get(getModelToken(User.name));



	// const resources = await resourceModel.find();


	// for (const resource of resources) {

	// 	if (resource.logo.startsWith('/public/')) {
	// 		resource.logo = `storage:/${resource.logo}`;
	// 		await resource.save();
	// 	}
	// }

	const users = await userModel.find();
	for(const user of users){
		if(!user.avatar.startsWith('public/')){
			continue;
		}

		user.avatar = `storage://${user.avatar}`;
		await user.save();
	}


	await app.close();

}


bootstrap();