import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min, MaxDate, Validate, IsIn, IsNotEmpty } from "class-validator";
import { User } from "../../auth/users/schemas/user.schema";
import { PartnerResource } from "../../resources/schemas/partner-resources.schema";
import { EntryExistsRule } from "../../shared/validators/entry-exists.validator";
import { DateAfter, DateBefore } from "../validators/date-comparison";
import { Report } from "../reports.schema";
import * as _ from 'lodash'

export class ReportFilterDto {

    
    @IsOptional()
    @Validate(EntryExistsRule, 
        [
            User.name,
            ({orcid_id}) => { return { orcid_id } }
        ])
    curator_orcid: string;

    @IsOptional()
    @Validate(EntryExistsRule,
        [
            PartnerResource.name,
            ({ resource_id }) => { return { resource_id }}
        ])
    resource_id: string

    @IsOptional()
    @Validate(EntryExistsRule,[
        Report.name,
        ({ activity_term }) => { return { activity_term }}
    ])
    activity_term: string


    @IsOptional()
    entity_uri: string

    // @Transform(({ value, obj }) => !obj.from && !obj.to ? 10 : value )
    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Max(50)
    page_size: number

    get_page_size(): null | number{
        if(!this.page && !_.isEmpty(_.pick(this, ['from', 'to']))){
            return undefined
        }else{
            return this.page_size || 10
        }
    }

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page: number

    get_page(): number{
        return this.page || 1
    }
    
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date(), { message: 'maximal allowed date for $property is the current Date'})
    @Validate(DateBefore, ['to'])
    from: Date


    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date(), { message: 'maximal allowed date for $property is the current Date'})
    @Validate(DateAfter, ['from'])
    to: Date

    
    @IsOptional()
    @IsIn(['timestamp', 'resource_id', 'entity_uri', 'curator_orcid', 'activity_term'])
    sortBy: string = 'timestamp'

    @IsOptional()
    @IsIn(['asc', 'desc', -1, 1])
    sortOrder: string | number = 'desc'

    @IsOptional()
    @IsIn(['date', 'activity_term'])
    groupBy:string

    
}

