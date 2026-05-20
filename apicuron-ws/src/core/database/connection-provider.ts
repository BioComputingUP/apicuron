import { ConfigService } from '@nestjs/config';
import {
	MongooseModuleAsyncOptions,
	MongooseModuleOptions,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { versionKeyUpdatePlugin } from './plugins';
import { Logger } from '@nestjs/common';

const mongoosePlugins = [versionKeyUpdatePlugin];
const logger = new Logger('ConnectionFactoryProvider');
export const ConnectionFactoryProvider: MongooseModuleAsyncOptions = {
	inject: [ConfigService],
	useFactory: async (
		configService: ConfigService,
	): Promise<MongooseModuleOptions> => {
		const db_host = configService.getOrThrow<string>('db_host');
		const database = configService.getOrThrow<string>('database');
		const port = configService.getOrThrow<number>('db_port');
		const mongodbUser = configService.get<string>('MONGODB_USER');
		const mongodbPassword = configService.get<string>('MONGODB_PASSWORD');
		let auth = '';
		if (!!mongodbPassword && !!mongodbUser) {
			auth = `${mongodbUser}:${encodeURIComponent(mongodbPassword)}@`;
		}
		const uri = `mongodb://${auth}${db_host}:${port}/${database}?authSource=${database}`;
		logger.log(`MongoDB Connection setup uri: ${uri}`);
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
