import { ResourceCategory } from '../../../core/enums';
import { DefaultWorkBuilder, workTypeFor } from './default.work-builder';

const ORCID = '0000-0002-0341-4888';

function build(category?: ResourceCategory, putCode?: string) {
	const builder = new DefaultWorkBuilder({
		getOrThrow: () => 'https://apicuron.org/',
	} as any);
	const user = {
		orcid_id: ORCID,
		getResourcePutCode: () => (putCode ? { resource_id: 'disprot-software', putCode } : undefined),
	};
	return builder.buildWork(
		{
			first_contribution: new Date('2024-03-01T00:00:00Z'),
			last_contribution: new Date('2026-10-01T00:00:00Z'),
			total_count: 7,
		} as any,
		{ resource_id: 'disprot-software', resource_name: 'DisProt software', category } as any,
		user as any,
		[{ activity_term: 'change_reviewing', activity_name: 'Change Reviewing', count: 7 }],
	);
}

describe('workTypeFor', () => {
	it.each([
		[ResourceCategory.Software, 'software'],
		[ResourceCategory.Training, 'other'],
		[ResourceCategory.Database, 'data-set'],
		[ResourceCategory.KnowledgeBase, 'data-set'],
		[undefined, 'data-set'],
	])('maps %s to %s', (category, type) => {
		expect(workTypeFor(category)).toBe(type);
	});
});

describe('DefaultWorkBuilder', () => {
	it('builds a software work with a narrative description and a link back', () => {
		const work = build(ResourceCategory.Software, '123');
		const profileUrl = `https://apicuron.org/curators/${ORCID}/disprot-software`;

		expect(work.type).toBe('software');
		expect(work.title).toBe('Contributions to DisProt software');
		expect(work.shortDescription).toBe(
			'Between 2024 and 2026, credited on APICURON for 7 contributions to DisProt software, all in Change Reviewing.',
		);
		expect(work.url?.href).toBe(profileUrl);
		expect(work.externalIds[0].url.href).toBe(profileUrl);
		expect(work.putCode).toBe('123');
	});

	it('keeps curation resources as data sets', () => {
		expect(build(ResourceCategory.Database).type).toBe('data-set');
	});
});
