// Generics
export type ObjectValues<T> = T[keyof T];
export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType[number];

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

export const ContributorIdentifierType = {
	GITHUB: 'GITHUB',
	ORCID: 'ORCID',
} as const;

export type ContributorIdentifierType = ObjectValues<
	typeof ContributorIdentifierType
>;

export const PendingReportStatus = {
	PENDING: 'PENDING',
	SUBMITTED: 'SUBMITTED',
	FAILED: 'FAILED',
} as const;

export type PendingReportStatus = ObjectValues<typeof PendingReportStatus>;


// == Contribution Event Enums == 
export const EventProcessingStatus = {
	RECEIVED: 'RECEIVED',
	PROCESSED: 'PROCESSED',
	FAILED: 'FAILED',
} as const;
export type EventProcessingStatus = (typeof EventProcessingStatus)[keyof typeof EventProcessingStatus];

export const EventOutputKind = { REPORT: 'REPORT', PENDING: 'PENDING' } as const;
export type EventOutputKind = (typeof EventOutputKind)[keyof typeof EventOutputKind];

export const EventOutputTypeSource = { PR_LABEL: 'pr_label', ISSUE_LABEL: 'issue_label', NONE: 'none' } as const;
export type EventOutputTypeSource = (typeof EventOutputTypeSource)[keyof typeof EventOutputTypeSource];

export const EventOutputStatus = {
	CREATED: 'CREATED',
	ALREADY_EXISTED: 'ALREADY_EXISTED',
	FAILED: 'FAILED',
} as const;
export type EventOutputStatus = (typeof EventOutputStatus)[keyof typeof EventOutputStatus];