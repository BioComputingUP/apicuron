import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { captureException } from '@sentry/nestjs';
import { Request, Response } from 'express';

/**
 * Handles every failed request: unexpected errors are reported to Sentry,
 * one line is logged with the request ID and the request ID is added to the error body.
 * The response is otherwise the same as Nest's default one.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger('FailedRequest');

	constructor(private readonly adapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const http = host.switchToHttp();
		const req = http.getRequest<Request & { user?: { orcid_id?: string } }>();
		const res = http.getResponse<Response>();
		const request_id = res.locals?.request_id as string | undefined;
		const { status, body } = this.buildResponse(exception);

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			captureException(exception, { tags: { request_id } });
		}
		this.log(exception, req, res, status, body);

		const { httpAdapter } = this.adapterHost;
		if (httpAdapter.isHeadersSent(res)) {
			httpAdapter.end(res);
			return;
		}
		httpAdapter.reply(res, { ...body, request_id }, status);
	}

	private buildResponse(exception: unknown): {
		status: number;
		body: Record<string, unknown>;
	} {
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();
			return {
				status,
				body:
					typeof response === 'object'
						? (response as Record<string, unknown>)
						: { statusCode: status, message: response },
			};
		}
		// errors from the "http-errors" library, e.g. thrown by express middlewares
		const { statusCode, message } = (exception ?? {}) as {
			statusCode?: number;
			message?: string;
		};
		if (statusCode && message) {
			return { status: statusCode, body: { statusCode, message } };
		}
		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			body: {
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Internal server error',
			},
		};
	}

	private log(
		exception: unknown,
		req: Request & { user?: { orcid_id?: string } },
		res: Response,
		status: number,
		body: Record<string, unknown>,
	) {
		// the query string is left out as it can hold secrets, e.g. the ORCID login code
		const path = (req.originalUrl ?? req.url).split('?')[0];
		const user = req.user?.orcid_id ?? 'anonymous';
		const started_at = res.locals?.started_at as number | undefined;
		const duration = started_at ? ` in ${Date.now() - started_at}ms` : '';
		const reason =
			status >= HttpStatus.INTERNAL_SERVER_ERROR
				? (exception as Error)?.message
				: [body.message].flat().join('; ');
		const line = `[${res.locals?.request_id ?? '-'}] ${
			req.method
		} ${path} by ${user} failed with ${status}${duration}: ${reason}`;

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(line, (exception as Error)?.stack);
		} else {
			this.logger.warn(line);
		}
	}
}
