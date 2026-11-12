import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { OrcidWork } from '../interfaces/orcid.interface';
import { escapeXml } from './escape-xml';
import { orcidWorkXmlSerializer } from './orcid-work-serializer';

describe('escapeXml', () => {
	it('escapes the five XML special characters', () => {
		expect(escapeXml(`a & b < c > d "e" 'f'`)).toBe(
			'a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;',
		);
	});

	it('leaves plain text unchanged', () => {
		expect(escapeXml('DisProt software')).toBe('DisProt software');
	});
});

describe('orcidWorkXmlSerializer', () => {
	const work: OrcidWork = {
		title: 'Contributions to R&D <Tools>',
		shortDescription: `Completed 3 Activities that contribute to "R&D" 'Tools'`,
		type: 'data-set',
		putCode: '12345',
		externalIds: [
			{
				type: 'uri',
				value: 'APICURON Profile for R&D <Tools>',
				url: new URL(
					'https://apicuron.org/curators/0000-0002-0341-4888/r-d?a=1&b=2',
				),
				relationship: 'self',
			},
		],
	};

	it('produces well-formed XML when values contain special characters', () => {
		const xml = orcidWorkXmlSerializer(work).trim();
		expect(XMLValidator.validate(xml)).toBe(true);
	});

	it('keeps the original values after parsing', () => {
		const xml = orcidWorkXmlSerializer(work).trim();
		const parsed = new XMLParser({
			ignoreAttributes: false,
			parseTagValue: false,
			processEntities: true,
		}).parse(xml);
		const parsedWork = parsed['work:work'];

		expect(parsedWork['@_put-code']).toBe('12345');
		expect(parsedWork['work:title']['common:title']).toBe(work.title);
		expect(parsedWork['work:short-description']).toBe(work.shortDescription);
		const externalId =
			parsedWork['common:external-ids']['common:external-id'];
		expect(externalId['common:external-id-value']).toBe(
			work.externalIds[0].value,
		);
		expect(externalId['common:external-id-url']).toBe(
			work.externalIds[0].url.href,
		);
	});
});
