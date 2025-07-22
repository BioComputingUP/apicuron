import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	EntityCreatedEvent,
	EntityDeletedEvent,
	EntityUpdatedEvent,
	ManyEntityUpdated,
} from '../events';
import { Term, TermDocument, TermModel } from '../schemas/terms.schema';
import { EntityRepository } from './entity-repository';

export class TermCreatedEvent extends EntityCreatedEvent<Term> {}
export class TermUpdatedEvent extends EntityUpdatedEvent<Term> {}
export class TermDeletedEvent extends EntityDeletedEvent<Term> {}
export class ManyTermUpdatedEvent extends ManyEntityUpdated<Term> {}
export class TermRepository extends EntityRepository<Term, TermModel> {
	constructor(
		@InjectModel(Term.name) TermModel: Model<TermDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(TermModel);

		this.publisher.pushToEventEmitter(eventEmitter, [
			[EntityCreatedEvent.name, TermCreatedEvent.name],
			[EntityUpdatedEvent.name, TermUpdatedEvent.name],
			[EntityDeletedEvent.name, TermDeletedEvent.name],
			[ManyEntityUpdated.name, ManyTermUpdatedEvent.name],
		]);
	}
}
