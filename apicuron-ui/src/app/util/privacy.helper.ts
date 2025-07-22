// Generics
type ObjectValues<T> = T[keyof T];
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

// Types
export const PrivacyType = {
	private: 'private',
	public: 'public',
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;

export const EmailVisibilityType = {
	public: 'public',
	private: 'private',
	limited: 'limited',
} as const;
export type EmailVisibilityType = ObjectValues<typeof EmailVisibilityType>;