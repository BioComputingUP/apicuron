/* eslint-disable @typescript-eslint/no-explicit-any */
import { requestIdMiddleware } from './request-id.middleware';

describe('requestIdMiddleware', () => {
	const run = (incoming?: string) => {
		const req = { header: () => incoming };
		const res = { locals: {} as Record<string, unknown>, setHeader: jest.fn() };
		const next = jest.fn();
		requestIdMiddleware(req as any, res as any, next);
		return { res, next };
	};

	it('generates an ID and returns it in the response header', () => {
		const { res, next } = run();

		expect(res.locals.request_id).toMatch(/^[0-9a-f-]{36}$/);
		expect(res.setHeader).toHaveBeenCalledWith(
			'X-Request-Id',
			res.locals.request_id,
		);
		expect(next).toHaveBeenCalled();
	});

	it("reuses the caller's ID", () => {
		expect(run('partner-42').res.locals.request_id).toBe('partner-42');
	});

	it('replaces an ID that could break the log lines', () => {
		const { res } = run('fake\n[abc] GET /reports');

		expect(res.locals.request_id).toMatch(/^[0-9a-f-]{36}$/);
	});
});
