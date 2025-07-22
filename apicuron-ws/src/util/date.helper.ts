import * as moment from 'moment-timezone';
export const TIMEZONE = 'UTC' as const;
export function updateMinDate(old: Date | null, newDate: Date) {
	return !!old && old.getTime() < newDate.getTime() ? old : newDate;
}

export function updateMaxDate(old: Date | null, newDate: Date) {
	return !!old && old.getTime() > newDate.getTime() ? old : newDate;
}

export function fromDate(date: Date): moment.Moment {
	return moment(date).tz(TIMEZONE);
}

export function fromYearWeek(year: number, week: number): moment.Moment {
	return moment().tz(TIMEZONE).year(year).isoWeek(week);
}

export function getWeekStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('isoWeek').toDate();
}

export function getWeekRange(momentInstance = moment()): [Date, Date] {
	return [getWeekStart(momentInstance), getWeekEnd(momentInstance)];
}

export function getWeekEnd(momentInstance = moment()): Date {
	return momentInstance
		.tz(TIMEZONE)
		.clone()
		.startOf('isoWeek')
		.add(1, 'week')
		.toDate();
}

export function getMonthStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('month').toDate();
}
export function getMonthEnd(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().endOf('month').toDate();
}

/**
 *
 * @param year Year number
 * @param month Month number between 1 and 12, (as exported by mongodb $month)
 * @returns Moment instance with date whithin the year and month passed as parameters
 */
export function fromYearMonth(year: number, month: number): moment.Moment {
	if (month > 12 || month < 1)
		throw new Error(`Invalid month passed to fromYearMonth`);

	// we make sure to decrement the month by 1 to fit momentjs 0 to 11 range
	return moment()
		.tz(TIMEZONE)
		.year(year)
		.month(month - 1);
}

export function getQuarterStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('quarter').toDate();
}

export function getDayStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('day').toDate();
}
