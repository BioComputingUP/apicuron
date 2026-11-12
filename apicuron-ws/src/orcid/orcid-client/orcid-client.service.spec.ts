import { OrcidWork } from './interfaces/orcid.interface';
import { OrcidClientService } from './orcid-client.service';

const ORCID = '0000-0002-0341-4888';
const API = 'https://api.sandbox.orcid.org/v3.0/';
const user = { orcid_id: ORCID, orcid_permission: 'not-a-real-token' };

const work: OrcidWork = {
	title: 'Contributions to DisProt',
	shortDescription: 'Completed 3 Activities that contribute to DisProt',
	type: 'data-set',
	putCode: '111',
	externalIds: [
		{
			type: 'uri',
			value: 'APICURON Profile for DisProt',
			url: new URL(`https://apicuron.org/curators/${ORCID}/disprot`),
			relationship: 'self',
		},
	],
};

function created(putCode: string) {
	return {
		status: 201,
		headers: { location: `${API}${ORCID}/work/${putCode}` },
		data: '',
	};
}

function setup(...responses: object[]) {
	const request = jest.fn();
	responses.forEach((response) => request.mockResolvedValueOnce(response));
	const service = new OrcidClientService(
		{ axiosRef: { request } } as any,
		API,
		{} as any,
	);
	service.logger = { debug: jest.fn(), log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
	return { service, request };
}

describe('OrcidClientService.submitWork', () => {
	it('updates the work with PUT when it has a put-code', async () => {
		const { service, request } = setup({ status: 200, headers: {}, data: '' });

		const result = await service.submitWork(user, work);

		expect(result).toEqual({ status: 200 });
		expect(request).toHaveBeenCalledTimes(1);
		expect(request.mock.calls[0][0]).toMatchObject({
			method: 'PUT',
			url: `${API}${ORCID}/work/111`,
		});
	});

	it('creates the work again with POST when the PUT returns 404', async () => {
		const { service, request } = setup(
			{ status: 404, headers: {}, data: 'Not found' },
			created('222'),
		);

		const result = await service.submitWork(user, work);

		expect(result).toEqual({ status: 201, putCode: '222' });
		expect(request).toHaveBeenCalledTimes(2);
		expect(request.mock.calls[1][0]).toMatchObject({
			method: 'POST',
			url: `${API}${ORCID}/work/`,
		});
		expect(request.mock.calls[1][0].data).not.toContain('put-code=');
	});

	it('re-creates only once: a 404 after the 409 retry fails instead of looping', async () => {
		const { service, request } = setup(
			{ status: 404, headers: {}, data: 'Not found' },
			{ status: 409, headers: {}, data: 'see element with put-code 333' },
			{ status: 404, headers: {}, data: 'Not found' },
		);

		await expect(service.submitWork(user, work)).rejects.toThrow();
		expect(request).toHaveBeenCalledTimes(3);
	});

	it('does not retry a 404 on a POST', async () => {
		const { service, request } = setup({ status: 404, headers: {}, data: 'Not found' });

		await expect(
			service.submitWork(user, { ...work, putCode: undefined }),
		).rejects.toThrow();
		expect(request).toHaveBeenCalledTimes(1);
	});
});
