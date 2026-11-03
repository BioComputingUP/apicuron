import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';

// a caller's own ID ends up in the logs, so it is only reused when it is short and plain
const VALID_REQUEST_ID = /^[\w-]{1,64}$/;

/**
 * Gives every request an ID, returned in the X-Request-Id header,
 * so a failed request can be found in the logs from the response the caller received.
 */
export function requestIdMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const incoming = req.header(REQUEST_ID_HEADER);
	const request_id =
		incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();

	res.locals.request_id = request_id;
	res.locals.started_at = Date.now();
	res.setHeader(REQUEST_ID_HEADER, request_id);
	next();
}
