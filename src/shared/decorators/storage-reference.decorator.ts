export const StorageReferenceMetadataKey = 'storageReference';

export const StorageReference =
	(): PropertyDecorator => (target: Object, propertyKey: string) => {
		Reflect.defineMetadata(
			StorageReferenceMetadataKey,
			true,
			target,
			propertyKey,
		);
	};
