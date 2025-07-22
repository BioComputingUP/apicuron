import {
	OrcidApiJsonWork,
	OrcidApiJsonExternalId,
} from '../interfaces/api.types';
import { OrcidWork } from '../interfaces/orcid.interface';
import { buildExternalId } from './build-external-id';

export function orcidWorkJsonSerializer(work: OrcidWork): OrcidApiJsonWork {
	return {
		title: {
			title: {
				value: work.title,
			},
			subtitle: work.subtitle ? { value: work.subtitle } : null,
		},
		'short-description': work.shortDescription,
		type: work.type,
		'external-ids': {
			'external-id': work.externalIds.map(
				(externalId): OrcidApiJsonExternalId => ({
					'external-id-type': externalId.type,
					'external-id-value': externalId.value,
					'external-id-url': { value: externalId.url.href },
					'external-id-relationship': externalId.relationship,
				}),
			),
		},
	};
}

export function orcidWorkXmlSerializer(
	orcidWork: OrcidWork,
	options = { includeXmlHeader: true },
): string {
	const { externalIds, title, shortDescription, type } = orcidWork;
	const putCode = orcidWork.putCode ? `put-code="${orcidWork.putCode}"` : '';

	const processedExternalIds = externalIds.map(buildExternalId).join('\n');
	const xmlHeader = options.includeXmlHeader
		? `<?xml version="1.0" encoding="UTF-8"?>`
		: '';
	return `
		${xmlHeader}
		<work:work
			xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xsi:schemaLocation="http://www.orcid.org/ns/work /work-3.0.xsd"
			${putCode}>
			<work:title>
				<common:title>${title}</common:title>
			</work:title>
			<work:short-description>${shortDescription}</work:short-description>
			<work:type>${type}</work:type>
			<common:external-ids>
			${processedExternalIds}
			</common:external-ids>
		</work:work>
		`;
}

export function orcidBulkWorkXmlSerializer(orcidWorks: OrcidWork[]): string {
	const works = orcidWorks
		.map((work) => orcidWorkXmlSerializer(work, { includeXmlHeader: false }))
		.join('\n');
	return `
		<?xml version="1.0" encoding="UTF-8"?>
		<bulk:bulk xmlns:common="http://www.orcid.org/ns/common"
			xmlns:work="http://www.orcid.org/ns/work"
			xmlns:bulk="http://www.orcid.org/ns/bulk"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xsi:schemaLocation="http://www.orcid.org/ns/bulk ../bulk-3.0.xsd">
				${works}
		</bulk:bulk>
	`;
}
