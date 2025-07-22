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
