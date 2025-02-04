import { PrivacyType, EmailVisibilityType } from "./privacy.helper";

export type EmailInput = {
	email: string;
	visibility?: EmailVisibilityType;
	primary?: boolean;
}