import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerResource, User } from 'src/core/schemas/index';
import { CuratorRegistryService } from 'src/curator-registry/curator-registry.service';
import { CuratorRegistryAggregatorService } from 'src/curator-registry/services/curator-registry-aggregator.service';
import { AppModule } from '../../app.module';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);
	const resourceModel: Model<PartnerResource> = app.get(
		getModelToken(PartnerResource.name),
	);
	const userModel: Model<User> = app.get(getModelToken(User.name));
	const logger = new Logger('RegistryRefreshScript');
	const resources = await resourceModel.find();

	const registryAggregator = await app.get(CuratorRegistryAggregatorService);
	const registryService = await app.get(CuratorRegistryService);

	for (const resource of resources) {
		logger.log(`Refreshing registry for resource ${resource.resource_id}`);
		await registryAggregator.recomputeAllResourceAggregates(
			resource.resource_id,
		);
	}
	logger.log('Updating user data');
	const users = await userModel.find();
	for (const user of users) {
		await registryService.updateUserData(user.orcid_id, user);
	}

	await app.close();
}

if (require.main === module) {
	console.log('called directly');
	void bootstrap();
}
