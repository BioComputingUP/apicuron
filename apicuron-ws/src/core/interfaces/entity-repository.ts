import { Model } from 'mongoose';
import { EntityCreatedEvent } from '../events/entity-created.event';
import { EntityDeletedEvent } from '../events/entity-deleted.event';
import { EntityUpdatedEvent } from '../events/entity-updated.event';
import { ManyEntityUpdated } from '../events/many-entity-updated.event';

export type EntityEvents<C> =
	| EntityCreatedEvent<C>
	| EntityUpdatedEvent<C>
	| EntityDeletedEvent<C>
	| ManyEntityUpdated<C>;

export type AllEntityEventClasses =
	| typeof EntityCreatedEvent
	| typeof EntityUpdatedEvent
	| typeof EntityDeletedEvent
	| typeof ManyEntityUpdated;
export type RepositoryEvent<C> = {
	name: string;
	value: EntityEvents<C>;
};

// Utility types

export type ExtractEntity<T> = T extends Model<
	infer U,
	unknown,
	unknown,
	unknown
>
	? U
	: never;
export type ExtractQueryHelpers<T> = T extends Model<
	unknown,
	infer QH,
	unknown,
	unknown
>
	? QH
	: never;
export type ExtractMethodsAndOverrides<T> = T extends Model<
	unknown,
	unknown,
	infer M,
	unknown
>
	? M
	: never;

export type ExtractVirtuals<T> = T extends Model<
	unknown,
	unknown,
	unknown,
	infer V
>
	? V
	: never;

export type ExtractSchema<T> = T extends Model<
	unknown,
	unknown,
	unknown,
	unknown,
	infer S
>
	? S
	: never;
