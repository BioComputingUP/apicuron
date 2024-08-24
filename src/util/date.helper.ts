const dayInMilliseconds: number = 24 * 60 * 60 * 1000;

export function getLastWeekDate(): Date {
	const currentDate = new Date();
	const lastWeek = new Date(currentDate.getTime() - 7 * dayInMilliseconds);
	lastWeek.setHours(0, 0, 0, 0);
	return lastWeek;
}

export function getLastDayDate(): Date {
	const currentDate = new Date();
	const lastDay = new Date(currentDate.getTime() - dayInMilliseconds);
	lastDay.setHours(0, 0, 0, 0);
	return lastDay;
}
