import { Model } from 'mongoose';
import { Term, TermDocument } from '../schemas/terms.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';

export class TermRepository extends EntityRepository<TermDocument> {
	constructor(@InjectModel(Term.name) TermModel: Model<TermDocument>) {
		super(TermModel);
	}
}
