import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";

import { User, UserDocument } from "src/core/schemas/user.schema";
import { OrcidClientService } from "src/orcid/orcid-client/orcid-client.service";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";


async function bootstrap() {
	// get required modules and models
	const app = await NestFactory.create(AppModule);

	const orcidClientService = app.get(OrcidClientService);

	const userModel: Model<UserDocument> = app.get(
		getModelToken(User.name),
	);

	// get all user orcids
	const all_users = await userModel.find().lean().select('orcid_id');
	// console.log('all_users:>> ', all_users);
	
	
	try{
		let updates = []
		console.log("Getting all user orcids...");
		for await (const user of all_users){
			const extra_orcid_info = await orcidClientService.get_user_info(user.orcid_id);
			updates.push(userModel.updateOne({orcid_id: user.orcid_id}, {$set: extra_orcid_info}));
		}
		console.log("Updating all users informations...");
		await Promise.all(updates)
		console.log("Done.");
	}catch(err){
		console.log(`[ERROR] Error updating user`);
		console.log("[ERROR]" + err);
	}
	
	await app.close()
}

bootstrap()