

export interface Paginated<T> {
    data: T[];
    total_count: number;
    page: number;
    page_size;
}