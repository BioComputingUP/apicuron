export const StorageReferenceMetadataKey = 'storageReference';

export const StorageReference =
	(): PropertyDecorator => (target: unknown, propertyKey: string) => {
		Reflect.defineMetadata(
			StorageReferenceMetadataKey,
			true,
			target,
			propertyKey,
		);
	};
