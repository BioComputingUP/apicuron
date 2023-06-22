import { Transform } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"
import * as _ from "lodash"



export class AchievementFilter {

    @IsOptional()
    @IsString()
    curator_orcid?: string


    @IsOptional()
    @IsString()
    resource_id?: string


    @IsOptional()
    @IsString()
    name?: string

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    count_threshold?: number

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page_size?: number = 10

    @IsOptional()
    @IsString()
    @IsIn(['count_threshold', 'name'])
    sortBy?: string

    @IsOptional()
    @IsString()
    @IsIn(['1', '-1', 'asc', 'desc'])
    sortOrder?: '1' | '-1' | 'asc' | 'desc'

    getQuery(){
        return _.pick(this, ['curator_orcid', 'resource_id', 'name', 'count_threshold'])   
    }

    getQueryOptions(){
        let sort = {}
        sort[this.sortBy] = this.sortOrder
        return {
            limit: this.page_size,
            skip: this.page - 1,
            sort
        }
    }

}