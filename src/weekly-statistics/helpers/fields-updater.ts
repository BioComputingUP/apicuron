import * as moment from 'moment-timezone';
import { TIMEZONE } from '../constants/start-of-week';
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

export function getWeekStartUTC(momentInstance = moment()): Date {
	return momentInstance.clone().startOf('isoWeek').toDate();
}

export function getWeekEndUTC(momentInstance = moment()): Date {
	return momentInstance.clone().startOf('isoWeek').add(1, 'week').toDate();
}
