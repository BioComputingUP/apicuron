type ObjectValues<T> = T[keyof T];

export const PrivacyType = {
	private: 'private',
	public: 'public',
} as const;
export type PrivacyType = ObjectValues<typeof PrivacyType>;

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
