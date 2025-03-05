import { TermDocument } from '../../core/schemas/terms.schema';
import { DeleteTermDto } from '../dto/deleteTerm.dto';

// export const TermDeletedEvent = 'on.term.deleted';
export interface ITermDeletedEventPayload {
	term: DeleteTermDto;
}

export class TermDeletedEvent implements ITermDeletedEventPayload {
	constructor(public readonly term: TermDocument) {}
}
export class TermUpdatedEvent {
	constructor(
		public readonly oldTerm: TermDocument,
		public readonly newTerm: TermDocument,
		public readonly date: Date = new Date(),
	) {}
}
