export function assertIsDefined<T>(
	value: T | null | undefined,
	message?: string,
	ErrorClass?: new (message?: string) => Error,
): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		const errorMessage =
			message ?? `Expected value to be non-nullable, but got ${value}`;
		if (ErrorClass) {
			throw new ErrorClass(errorMessage);
		}
		throw new Error(errorMessage);
	}
}
