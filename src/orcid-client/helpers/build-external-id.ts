import { OrcidExternalId } from "../interfaces/orcid.interface";

export function buildExternalId(externalId: OrcidExternalId): string{
	return `
	<common:external-id>
		<common:external-id-type>${externalId.type}</common:external-id-type>
		<common:external-id-value>${externalId.value}</common:external-id-value>			
		<common:external-id-url>${externalId.url.href}</common:external-id-url>
		<common:external-id-relationship>${externalId.relationship}</common:external-id-relationship>
	</common:external-id>`;
}