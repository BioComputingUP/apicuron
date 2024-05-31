import { TermDocument } from '../../core/schemas/terms.schema';
import { DeleteTermDto } from '../dto/deleteTerm.dto';

// export const TermDeletedEvent = 'on.term.deleted';
export interface ITermDeletedEventPayload {
	term: DeleteTermDto;
}

export class TermDeletedEvent implements ITermDeletedEventPayload {
	constructor(public readonly term: DeleteTermDto) {}
}
export const TermUpdatedEvent = 'on.term.updated';
export interface ITermUpdatedEventPayload {
	term: TermDocument;
}
