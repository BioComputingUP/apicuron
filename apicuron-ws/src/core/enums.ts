// Generics
export type ObjectValues<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

// Types
export const PrivacyType = {
	private: 'private',
	public: 'public',
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;

export const VisibilityType = {
	private: 'private',
	public: 'public',
	limited: 'limited',
} as const;
export type VisibilityType = ObjectValues<typeof VisibilityType>;

export const ContributionType = {
	community: 'community',
	professional: 'professional',
} as const;
export type ContributionType = ObjectValues<typeof ContributionType>;

export const AchievementState = {
	progress: 'progress',
	achieved: 'achieved',
} as const;
export type AchievementState = ObjectValues<typeof AchievementState>;

export const AchievementType = {
	badge: 'badge',
	medal: 'medal',
} as const;
export type AchievementType = ObjectValues<typeof AchievementType>;

// utilities

export const DaysOfWeek = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;
export type DayOfWeek = ArrayElement<typeof DaysOfWeek>;

export const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
] as const;
export type Month = ArrayElement<typeof months>;

// Resource Categories

export const ResourceCategory = {
	Database: 'Database',
    KnowledgeBase: 'KnowledgeBase',
	Software: 'Software',
	Training: 'Training',
} as const;

export const ResourceCategories = Object.values(ResourceCategory);

export type ResourceCategory = ObjectValues<typeof ResourceCategory>;