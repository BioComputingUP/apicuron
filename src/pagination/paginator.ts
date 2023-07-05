import { PaginateDto } from "./dto/paginate.dto";
import { Paginated } from "./interfaces/paginated";





export function paginate(data: any[], page: PaginateDto, totalCount: number): Paginated<typeof data> {


    return {
        data,
        meta: {
            pagination: {
                start: page.skip + 1,
                limit: page.limit,
                total: totalCount
            }
        }
    }
}