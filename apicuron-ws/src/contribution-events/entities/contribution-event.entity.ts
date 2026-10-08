import { EventOutputKind, ContributorIdentifierType, EventOutputStatus, EventProcessingStatus } from "src/core/enums";

export interface ContributionEventOutput {
	kind: EventOutputKind;
	activity_term: string;
	contributor_identifier: string;
	contributor_identifier_type: ContributorIdentifierType;
	status: EventOutputStatus;
	error?: string;
}

export interface NewContributionEvent {
	event_id: string;
	source: string;
	type: string;
	subject: string;
	time: Date;
	dataschema: string;
	resource_id: string;
	payload: Record<string, unknown>;
}

export interface ContributionEvent extends NewContributionEvent {
	id: string;
	received_at: Date;
	processing: {
		status: EventProcessingStatus;
		interpreter_version?: string;
		processed_at?: Date;
		error?: string;
		attempts: number;
	};
	outputs: ContributionEventOutput[];
}