
type ObjectValues<T> = T[keyof T];

// Types
export const ConfirmationResponse = {
	accepted: 'accepted',
	rejected: 'rejected',
} as const;
export type ConfirmationResponse = ObjectValues<typeof ConfirmationResponse>;

export interface ConfirmationOptions {
  message: string;
  title: string;
  iconSrc?: string;
  confirmationText?: string;
  cancelText?: string;
  style?: ConfirmationStyleOptions;
  accept: () => unknown | Promise<unknown>;
  reject: () => unknown | Promise<unknown>;
}

export interface ConfirmationStyleOptions {
  confirmationBgColor?: string;
  cancelBgColor?: string;
  confirmationTextColor?: string;
  cancelTextColor?: string;
}

export type Confirmation = Required<ConfirmationOptions>;

export const DEFAULT_CONFIRMATION: Confirmation = {
	message: '',
	title: '',
	iconSrc: 'assets/svg/exclamation-circle.svg',
	confirmationText: 'Proceed',
	cancelText: 'Cancel',
	style: {
		confirmationBgColor: "#4D194D",
		confirmationTextColor: '#fff',
		cancelBgColor: '#6c757d',
		cancelTextColor: '#fff',
	},
	accept: () => {},
	reject: () => {},
};
