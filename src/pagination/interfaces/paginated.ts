export type Paginated<T> = {
	data: T[];
	meta: {
		pagination: {
			start: number;
			limit: number;
			total: number;
		};
	};
};
