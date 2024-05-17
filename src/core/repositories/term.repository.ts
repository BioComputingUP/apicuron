import { Model } from 'mongoose';
import { Term, TermDocument } from '../schemas/terms.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class TermRepository extends EntityRepository<TermDocument> {
	constructor(
		@InjectModel(Term.name) TermModel: Model<TermDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(TermModel, eventEmitter);
	}
}
