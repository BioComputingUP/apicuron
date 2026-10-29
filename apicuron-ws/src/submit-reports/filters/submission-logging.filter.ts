import {
	ArgumentsHost,
	Catch,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request } from 'express';

/**
 * Logs the reason of every failed report submission, including the validation errors
 * thrown by the ValidationPipe before the route handler runs, then responds as usual.
 */
@Catch()
export class SubmissionLoggingFilter extends BaseExceptionFilter {
	private readonly logger = new Logger('ReportSubmission');

	catch(exception: unknown, host: ArgumentsHost) {
		const req = host
			.switchToHttp()
			.getRequest<Request & { user?: { orcid_id?: string } }>();
		const submitter = req.user?.orcid_id ?? 'anonymous';
		const route = `${req.method} ${req.originalUrl ?? req.url}`;

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();
			const reason =
				typeof response === 'string'
					? response
					: [
							(response as { message?: string | string[] }).message ??
								exception.message,
					  ]
							.flat()
							.join('; ');
			const log = `${route} by ${submitter} failed with ${status}: ${reason}`;
			if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
				this.logger.error(log, exception.stack);
			} else {
				this.logger.warn(log);
			}
		} else {
			this.logger.error(
				`${route} by ${submitter} failed with an unexpected error: ${
					(exception as Error)?.message
				}`,
				(exception as Error)?.stack,
			);
		}

		super.catch(exception, host);
	}
}
