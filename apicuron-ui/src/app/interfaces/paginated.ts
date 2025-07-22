

export interface Paginated<T> {
    data: T[];
    meta: {
        pagination: {
            total: number;
            start: number;
            limit: number;
        }
    }
}