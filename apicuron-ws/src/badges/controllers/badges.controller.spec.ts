/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrivacyType } from '../../core/enums';
import { BadgeFilter } from '../dto/badge-filter.dto';
import { BadgesController } from './badges.controller';

describe('BadgesController GET achievements/badges', () => {
	const ORCID = '0000-0002-0341-4888';
	let queryService: { getBadges: jest.Mock };
	let controller: BadgesController;

	const appliedFilter = () => queryService.getBadges.mock.calls[0][0];

	beforeEach(() => {
		queryService = {
			getBadges: jest.fn().mockResolvedValue({ count: 0, data: [] }),
		};
		controller = new BadgesController(queryService as any);
	});

	it('only returns public badges to anonymous users', async () => {
		await controller.get_badges(new BadgeFilter(), null);

		expect(appliedFilter()).toEqual({ privacy: PrivacyType.public });
	});

	it('also returns the private badges a logged in user can see', async () => {
		const user = {
			orcid_id: ORCID,
			resources: [{ resource_id: 'disprot' }],
		} as any;

		await controller.get_badges(new BadgeFilter(), user);

		expect(appliedFilter().$or).toEqual(
			expect.arrayContaining([
				{
					$or: [
						{ resource_id: { $in: ['disprot'] } },
						{ privacy: PrivacyType.public },
					],
				},
				{
					$or: [{ curator_orcid: ORCID }, { privacy: PrivacyType.public }],
				},
			]),
		);
	});

	it('applies the privacy filter along with the requested filters', async () => {
		const filter = new BadgeFilter();
		filter.resource_id = 'disprot';

		await controller.get_badges(filter, null);

		expect(appliedFilter()).toEqual({
			resource_id: 'disprot',
			privacy: PrivacyType.public,
		});
	});
});
