import { Transform } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"
import * as _ from "lodash"
import { PaginateDto } from "../../pagination/dto/paginate.dto"



export class AchievementFilter extends PaginateDto {

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

}