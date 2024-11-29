import { ConfigService } from '@nestjs/config';
import {
	MongooseModuleAsyncOptions,
	MongooseModuleOptions,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { versionKeyUpdatePlugin } from './plugins';

const mongoosePlugins = [versionKeyUpdatePlugin];

export const ConnectionFactoryProvider: MongooseModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: async (
		configService: ConfigService,
	): Promise<MongooseModuleOptions> => {
		const db_host = configService.get<string>('db_host');
		const database = configService.get<string>('database');
		const port = configService.get<number>('db_port');
		const uri = `mongodb://${db_host}:${port}/${database}`;
		// logger.log(`MongoDB Connection setup uri: ${uri}`);
		return {
			uri,
			connectionFactory: (connection: Connection) => {
				for (const pluginFunction of mongoosePlugins) {
					connection.plugin(pluginFunction);
				}

				return connection;
			},
		};
	},
};
