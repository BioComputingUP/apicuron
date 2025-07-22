import { S3Client } from '@aws-sdk/client-s3';
import { LocalFsEngine, S3Engine } from '@biocomputingup/nest-storage-manager';
import {
	AnyAsyncEngineDefinition,
	StorageModuleConfig,
} from '@biocomputingup/nest-storage-manager/dist/interfaces';
import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ObjectValues<T> = T[keyof T];

export const StorageType = {
	private: 'private',
	public: 'public',
} as const;
export type StorageType = ObjectValues<typeof StorageType>;

const storageConfigMapper = {
	[StorageType.private]: 'PRIVATE_STORAGE',
	[StorageType.public]: 'PUBLIC_STORAGE',
};

/**
 * Creates a definition for an asynchronous storage engine based on the provided storage type.
 *
 * If the environment is "local", the function returns a LocalFsEngine instance.
 * For "production" or "development" environments, it returns an S3Engine instance.
 *
 * @param storageType - The type of storage to configure.
 * @returns An AnyAsyncEngineDefinition containing the relevant engine configuration.
 * @throws {Error} If the environment is neither "local", "production", nor "development".
 */
const storageDefFactory = (
	storageType: StorageType,
): AnyAsyncEngineDefinition => ({
	name: storageType,
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const storageConfigKey = storageConfigMapper[storageType];
		if (!storageConfigKey) {
			throw new Error('Invalid storage type');
		}
		const configObject = config.get(storageConfigKey);

		if (configObject.engineType === 'LocalFs') {
			return {
				engine: new LocalFsEngine(configObject.config),
			};
		}
		if (configObject.engineType === 'S3') {
			const [clientConfig, engineConfig] = configObject.config;
			return {
				engine: new S3Engine(engineConfig, new S3Client(clientConfig)),
			};
		}
		throw new NotImplementedException(
			`Unsupported storage engine type: ${configObject.engineType}`,
		);
	},
});

export const PublicStorageConfigFactory: AnyAsyncEngineDefinition =
	storageDefFactory(StorageType.public);

export const PrivateStorageConfigFactory: AnyAsyncEngineDefinition =
	storageDefFactory(StorageType.private);

export const StorageModuleOptions: StorageModuleConfig = {
	default: StorageType.public,
	engines: [PrivateStorageConfigFactory, PublicStorageConfigFactory],
};
