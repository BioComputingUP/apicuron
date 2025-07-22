export class ConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConfigurationError';
	}
}

export class UnexpectedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UnexpectedError';
	}
}

export function throwError<T extends Error>(
	ErrorClass: new (...args: unknown[]) => T,
	message = 'Fatal Error',
): never {
	const error = new ErrorClass(message);
	throw error;
}
