export function assertNotNull<T>(
	value: T | null | undefined,
	message?: string,
): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		throw new Error(
			message ?? `Expected value to be non-nullable, but got ${value}`,
		);
	}
}

export function throwError<T extends Error>(
	ErrorClass: new (...args: unknown[]) => T,
	message = 'Fatal Error',
): never {
	const error = new ErrorClass(message);
	throw error;
}
