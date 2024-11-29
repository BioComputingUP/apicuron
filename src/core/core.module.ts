import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SyncIndexesService } from './services/sync-indexes.service';
import { ModelDefinitions, ModelFactories } from './schemas';
import { UserRepository } from './repositories/user.repository';
import { ConnectionFactoryProvider } from './database/connection-provider';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
	imports: [
		EventEmitterModule,
		// in here we use the forRootAsync https://docs.nestjs.com/techniques/mongodb#async-configuration
		// to be able to access the configService asnchronously because it cannot be loaded sooner
		// due to the fact that this is the appmodule
		MongooseModule.forRootAsync(ConnectionFactoryProvider),
		MongooseModule.forFeature(ModelDefinitions),
		MongooseModule.forFeatureAsync(ModelFactories),
	],

	providers: [UserRepository, SyncIndexesService],

	exports: [UserRepository, MongooseModule],
})
export class CoreApicuronModule {}
