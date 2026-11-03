/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { captureException } from '@sentry/nestjs';
import { GlobalExceptionFilter } from './global-exception.filter';

jest.mock('@sentry/nestjs', () => ({ captureException: jest.fn() }));

describe('GlobalExceptionFilter', () => {
	const ORCID = '0000-0002-1825-0097';
	let httpAdapter: {
		isHeadersSent: jest.Mock;
		reply: jest.Mock;
		end: jest.Mock;
	};
	let warn: jest.SpyInstance;
	let error: jest.SpyInstance;
	let filter: GlobalExceptionFilter;

	const catchFor = (
		exception: unknown,
		url = '/reports',
		headers: Record<string, string> = {},
	) => {
		const req = {
			method: 'POST',
			originalUrl: url,
			headers,
			user: { orcid_id: ORCID },
		};
		const res = { locals: { request_id: 'abc-123', started_at: Date.now() } };
		filter.catch(exception, {
			switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
		} as any);
	};

	beforeEach(() => {
		httpAdapter = {
			isHeadersSent: jest.fn().mockReturnValue(false),
			reply: jest.fn(),
			end: jest.fn(),
		};
		warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
		error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
		filter = new GlobalExceptionFilter({ httpAdapter } as any);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.mocked(captureException).mockClear();
	});

	it('keeps the usual body of an HTTP error, adds the request ID and logs a warning', () => {
		catchFor(new ForbiddenException('Forbidden resource'));

		expect(httpAdapter.reply).toHaveBeenCalledWith(
			expect.anything(),
			{
				statusCode: 403,
				message: 'Forbidden resource',
				error: 'Forbidden',
				request_id: 'abc-123',
			},
			403,
		);
		expect(warn.mock.calls[0][0]).toMatch(
			new RegExp(
				`^\\[abc-123\\] POST /reports by ${ORCID} failed with 403 in \\d+ms: Forbidden resource$`,
			),
		);
		expect(captureException).not.toHaveBeenCalled();
	});

	it('hides unexpected errors from the caller, logs them and reports them to Sentry', () => {
		const exception = new Error('connection lost');

		catchFor(exception);

		expect(httpAdapter.reply).toHaveBeenCalledWith(
			expect.anything(),
			{
				statusCode: 500,
				message: 'Internal server error',
				request_id: 'abc-123',
			},
			500,
		);
		expect(error.mock.calls[0][0]).toContain('failed with 500');
		expect(error.mock.calls[0][0]).toContain('connection lost');
		expect(captureException).toHaveBeenCalledWith(
			exception,
			expect.objectContaining({ tags: { request_id: 'abc-123' } }),
		);
	});

	it('does not log the query string', () => {
		catchFor(
			new ForbiddenException('Forbidden resource'),
			'/auth/orcid/redirect?code=secret',
		);

		expect(warn.mock.calls[0][0]).toContain('/auth/orcid/redirect by');
		expect(warn.mock.calls[0][0]).not.toContain('secret');
	});

	it('hints at the version header when an unknown route is called without it', () => {
		catchFor(new NotFoundException('Cannot POST /reports'));
		catchFor(new NotFoundException('Cannot POST /reports'), '/reports', {
			version: '2',
		});

		expect(httpAdapter.reply.mock.calls[0][1].message).toBe(
			'Cannot POST /reports. Most API routes require the header version: 2',
		);
		expect(httpAdapter.reply.mock.calls[1][1].message).toBe(
			'Cannot POST /reports',
		);
	});

	it('only ends the response when it was already sent', () => {
		httpAdapter.isHeadersSent.mockReturnValue(true);

		catchFor(new ForbiddenException('Forbidden resource'));

		expect(httpAdapter.reply).not.toHaveBeenCalled();
		expect(httpAdapter.end).toHaveBeenCalled();
	});
});
