type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
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
