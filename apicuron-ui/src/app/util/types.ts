import { PrivacyType, EmailVisibilityType } from "./privacy.helper";
type ObjectValues<T> = T[keyof T];
export type EmailInput = {
	email: string;
	visibility?: EmailVisibilityType;
	primary?: boolean;
}

export const ActivityCategory = {
	generation: "generation",
	revision: "revision",
	invalidation: "invalidation",
} as const;
export type ActivityCategory = ObjectValues<typeof ActivityCategory>;