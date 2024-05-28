export function updateMinDate(old: Date | null, newDate: Date) {
	return !!old && old.getTime() < newDate.getTime() ? old : newDate;
}

export function updateMaxDate(old: Date | null, newDate: Date) {
	return !!old && old.getTime() > newDate.getTime() ? old : newDate;
}
