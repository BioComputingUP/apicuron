import { Transform, Type } from "class-transformer";
import { IsDate, IsDateString, IsInt, IsOptional, Max, Min, MaxDate, Validate, IsIn } from "class-validator";
import { User } from "../../auth/users/schemas/user.schema";
import { PartnerResource } from "../../resources/schemas/partner-resources.schema";
import { EntryExistsRule } from "../../shared/validators/entry-exists.validator";
import { DateAfter, DateBefore } from "../validators/date-comparison";
import { validate } from 'class-validator';
import { FilterQuery, QueryOptions, SortOrder, StringExpressionOperatorReturningObject } from "mongoose";
import { Report } from "../reports.schema";

export class ReportFilterDto {

    
    @IsOptional()
    @Validate(EntryExistsRule, 
        [
            User.name,
            ({orcid_id}) => { return { orcid_id } }
        ])
    orcid_id: string;

    @IsOptional()
    @Validate(EntryExistsRule,
        [
            PartnerResource.name,
            ({ resource_id }) => { return { resource_id }}
        ])
    resource_id: string

    @IsOptional()
    @Transform(({ value, obj }) => !value && !obj.from && !obj.to ? 10 : undefined )
    @IsInt()
    @Max(50)
    page_size: number


    @IsOptional()
    @Transform(({ value, obj }) => !value && !obj.from && !obj.to ? 1 : undefined )
    @IsInt()
    @Min(1)
    page: number


    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date())
    @Validate(DateBefore, ['to'])
    from: Date


    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date())
    @Validate(DateAfter, ['from'])
    to: Date

    
    @IsOptional()
    @IsIn(['timestamp', 'resource_id', 'entity_uri', 'curator_orcid', 'activity_term'])
    sortBy?: string = 'timestamp'

    @IsOptional()
    @IsIn(['asc', 'desc', -1, 1])
    sortOrder?: string | number = 'desc'

    sort_object(){
        const sortObj = {}
        sortObj[this.sortBy] = this.sortOrder
        return sortObj
    }


    public static makeQuery (dto: ReportFilterDto): { filter: FilterQuery<Report>, options: QueryOptions<Report> }{
        let filter: FilterQuery<Report> = {}

        // orcid_id filter
        if(dto.orcid_id){
            filter['curator_orcid'] = dto.orcid_id
        }

        // resource_id filter
        if(dto.resource_id){
            filter['resource_id'] = dto.resource_id
        }

        // timestamp filter object
        let timestamp: any = {}

        if(dto.from){
            timestamp.$gte = dto.from.toISOString()
        }
        if(dto.to){
            timestamp.$lte = dto.to.toDateString()
        }

        if(Object.keys(timestamp).length > 0){
            filter = {
                ...filter,
                timestamp       
            }
        }

        // pagination objects
        let skip = 0, limit = 10;
        if(dto.page){
            skip = (dto.page - 1) * dto.page_size;
        }else{
            if(Object.keys(timestamp).length > 0){
                skip = 0
                limit = 0
            }
        }

        let sort = {}
        sort[dto.sortBy] = dto.sortOrder

        const options : QueryOptions<Report> = {
            sort,
            skip,
            limit
        }

        return {
            filter,
            options
        }
        

    }

    
}
