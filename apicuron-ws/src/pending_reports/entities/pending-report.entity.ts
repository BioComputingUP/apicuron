import { ContributorIdentifierType } from 'src/core/enums';
import { PendingReportDocument } from 'src/core/schemas/pending reports/pending-report.schema';

export class PendingReport {
	id: string;
	resource_id: string;
	entity_uri: string;
	activity_term: string;
	timestamp: Date;
	contributor_identifier: string;
	contributor_identifier_type: ContributorIdentifierType;
	contributor_login?: string;

	constructor({
		id,
		resource_id,
		entity_uri,
		activity_term,
		timestamp,
		contributor_identifier,
		contributor_identifier_type,
		contributor_login,
	}: {
		id: string;
		resource_id: string;
		entity_uri: string;
		activity_term: string;
		timestamp: Date;
		contributor_identifier: string;
		contributor_identifier_type: ContributorIdentifierType;
		contributor_login?: string;
	}) {
		this.id = id;
		this.resource_id = resource_id;
		this.entity_uri = entity_uri;
		this.activity_term = activity_term;
		this.timestamp = timestamp;
		this.contributor_identifier = contributor_identifier;
		this.contributor_identifier_type = contributor_identifier_type;
		this.contributor_login = contributor_login;
	}

	static fromMongooseDocument(document: PendingReportDocument) {
		return new PendingReport({
			id: document._id.toString(),
			resource_id: document.resource_id,
			entity_uri: document.entity_uri,
			activity_term: document.activity_term,
			timestamp: document.timestamp,
			contributor_identifier: document.contributor_identifier,
			contributor_identifier_type: document.contributor_identifier_type,
			contributor_login: document.contributor_login,
		});
	}
}
