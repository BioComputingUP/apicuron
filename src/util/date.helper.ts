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

export function getQuarterStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('quarter').toDate();
}

export function getDayStart(momentInstance = moment()): Date {
	return momentInstance.tz(TIMEZONE).clone().startOf('day').toDate();
}
