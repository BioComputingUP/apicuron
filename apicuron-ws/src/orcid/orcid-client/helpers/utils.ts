export interface Orcid_Date {
	year: { value: string };
	month: { value: string };
	day: { value: string };
}

export function parseDateObjectIntoString(date: Orcid_Date | null): string {
	if (!date) {
		return '';
	}
	const year = date.year?.value || '';
	const month = date.month?.value || '';
	const day = date.day?.value || '';

	let dateString = year;
	if (month) {
		dateString += `/${month}`;
	}
	if (day) {
		dateString += `/${day}`;
	}

	return dateString;
}
