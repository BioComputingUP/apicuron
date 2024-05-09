export function getLastWeekDate(): Date {
	const currentDate = new Date();
	const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
	lastWeek.setHours(0, 0, 0, 0);
	return lastWeek;
}
