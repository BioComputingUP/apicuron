import { TermDocument } from '../../core/schemas/terms.schema';
import { DeleteTermDto } from '../dto/deleteTerm.dto';

export const onTermDeletedEvent = 'on.term.deleted';
export interface ITermDeletedEventPayload {
	term: DeleteTermDto;
}
export const onTermUpdatedEvent = 'on.term.updated';
export interface ITermUpdatedEventPayload {
	term: TermDocument;
}
