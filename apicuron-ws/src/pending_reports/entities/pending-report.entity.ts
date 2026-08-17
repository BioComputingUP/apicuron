import { ContributorIdentifierType } from 'src/core/enums';
import { PendingReportDocument } from 'src/core/schemas/pending reports/pending-report.schema';

export class PendingReport {
	resource_id: string;
	entity_uri: string;
	activity_term: string;
	timestamp: Date;
	contributor_identifier: string;
	contributor_identifier_type: ContributorIdentifierType;

	constructor({
		resource_id,
		entity_uri,
		activity_term,
		timestamp,
		contributor_identifier,
		contributor_identifier_type,
	}: {
		resource_id: string;
		entity_uri: string;
		activity_term: string;
		timestamp: Date;
		contributor_identifier: string;
		contributor_identifier_type: ContributorIdentifierType;
	}) {
		this.resource_id = resource_id;
		this.entity_uri = entity_uri;
		this.activity_term = activity_term;
		this.timestamp = timestamp;
		this.contributor_identifier = contributor_identifier;
		this.contributor_identifier_type = contributor_identifier_type;
	}

	static fromMongooseDocument(document: PendingReportDocument) {
		return new PendingReport({
			resource_id: document.resource_id,
			entity_uri: document.entity_uri,
			activity_term: document.activity_term,
			timestamp: document.timestamp,
			contributor_identifier: document.contributor_identifier,
			contributor_identifier_type: document.contributor_identifier_type,
		});
	}
}
