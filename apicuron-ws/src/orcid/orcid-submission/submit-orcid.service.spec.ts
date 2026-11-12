import { SubmitOrcidWork } from './submit-orcid.service';

const ORCID = '0000-0002-0341-4888';

function makeUser() {
	const putCodes: { resource_id: string; putCode: string }[] = [];
	return {
		orcid_id: ORCID,
		displayedName: 'Test User',
		orcid_permission: 'not-a-real-token',
		setResourcePutCode: jest.fn((resource_id: string, putCode: string) => {
			putCodes.push({ resource_id, putCode });
		}),
		save: jest.fn(),
	};
}

function makeStat(resource_id: string) {
	return {
		resource_id,
		resource: { toObject: () => ({ resource_id, resource_name: resource_id }) },
	};
}

function setup({
	stats,
	submitWork,
	matchedCount = 0,
	detailedStats = [],
}: {
	stats: ReturnType<typeof makeStat>[];
	submitWork: jest.Mock;
	matchedCount?: number;
	detailedStats?: object[];
}) {
	const user = makeUser();
	const userModel = {
		updateOne: jest.fn().mockResolvedValueOnce({ matchedCount }).mockResolvedValue({}),
	};
	const userRepository = {
		find: jest.fn(() => ({
			sort: () => ({
				cursor: () =>
					(async function* () {
						yield user;
					})(),
			}),
		})),
	};
	const statModel = { find: jest.fn().mockResolvedValue(stats) };
	const detailedStatModel = {
		find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(detailedStats) })),
	};
	const builder = {
		buildWork: jest.fn((..._args: unknown[]) => ({ title: 'work' })),
	};

	const service = new SubmitOrcidWork(
		{ submitWork } as any,
		statModel as any,
		detailedStatModel as any,
		userModel as any,
		userRepository as any,
		builder as any,
		false,
		{} as any,
	);
	service.logger = { debug: jest.fn(), error: jest.fn() } as any;
	return { service, user, userModel, builder };
}

describe('SubmitOrcidWork', () => {
	it('submits a user’s works one at a time', async () => {
		let inFlight = 0;
		let maxInFlight = 0;
		const submitWork = jest.fn(async () => {
			inFlight++;
			maxInFlight = Math.max(maxInFlight, inFlight);
			await new Promise((resolve) => setTimeout(resolve, 5));
			inFlight--;
			return { status: 200 };
		});
		const { service } = setup({
			stats: [makeStat('a'), makeStat('b'), makeStat('c')],
			submitWork,
		});

		await service.submitAllWorks({ orcid_id: ORCID });

		expect(submitWork).toHaveBeenCalledTimes(3);
		expect(maxInFlight).toBe(1);
	});

	it('pushes a new put-code with a direct update instead of user.save()', async () => {
		const submitWork = jest.fn().mockResolvedValue({ status: 201, putCode: '42' });
		const { service, user, userModel } = setup({
			stats: [makeStat('a')],
			submitWork,
			matchedCount: 0,
		});

		await service.submitAllWorks({ orcid_id: ORCID });

		expect(user.save).not.toHaveBeenCalled();
		expect(userModel.updateOne).toHaveBeenNthCalledWith(
			1,
			{ orcid_id: ORCID, 'orcid_work_put_codes.resource_id': 'a' },
			{ $set: { 'orcid_work_put_codes.$.putCode': '42' } },
		);
		expect(userModel.updateOne).toHaveBeenNthCalledWith(
			2,
			{ orcid_id: ORCID, 'orcid_work_put_codes.resource_id': { $ne: 'a' } },
			{ $push: { orcid_work_put_codes: { resource_id: 'a', putCode: '42' } } },
		);
		expect(user.setResourcePutCode).toHaveBeenCalledWith('a', '42');
	});

	it('replaces an existing put-code without pushing a second entry', async () => {
		const submitWork = jest.fn().mockResolvedValue({ status: 201, putCode: '43' });
		const { service, userModel } = setup({
			stats: [makeStat('a')],
			submitWork,
			matchedCount: 1,
		});

		await service.submitAllWorks({ orcid_id: ORCID });

		expect(userModel.updateOne).toHaveBeenCalledTimes(1);
	});

	it('keeps going with the next resource when one submission fails', async () => {
		const submitWork = jest
			.fn()
			.mockRejectedValueOnce(new Error('ORCID said no'))
			.mockResolvedValue({ status: 200 });
		const { service } = setup({
			stats: [makeStat('a'), makeStat('b')],
			submitWork,
		});

		await service.submitAllWorks({ orcid_id: ORCID });

		expect(submitWork).toHaveBeenCalledTimes(2);
	});

	it('passes each resource its public per-activity counts', async () => {
		const submitWork = jest.fn().mockResolvedValue({ status: 200 });
		const changeReviewing = {
			activity_term: 'change_reviewing',
			activity_name: 'Change Reviewing',
			count: 5,
		};
		const { service, builder } = setup({
			stats: [makeStat('a'), makeStat('b')],
			submitWork,
			detailedStats: [
				{
					resource_id: 'a',
					activities: [{ ...changeReviewing, score: 1, description: 'x' }],
				},
			],
		});

		await service.submitAllWorks({ orcid_id: ORCID });

		expect(builder.buildWork.mock.calls[0][3]).toEqual([changeReviewing]);
		expect(builder.buildWork.mock.calls[1][3]).toEqual([]);
	});
});
