// Generics
type ObjectValues<T> = T[keyof T];
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

// Types
export const PrivacyType = {
	private: 'private',
	public: 'public',
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;