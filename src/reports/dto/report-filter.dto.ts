import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min, MaxDate, Validate, IsIn, IsNotEmpty, ValidateIf } from "class-validator";
import { User } from "../../auth/users/schemas/user.schema";
import { PartnerResource } from "../../resources/schemas/partner-resources.schema";
import { EntryExistsRule } from "../../shared/validators/entry-exists.validator";
import { DateAfter, DateBefore } from "../validators/date-comparison";
import { Report } from "../reports.schema";
import * as _ from 'lodash';
import { Term } from "../../terms/schemas/terms.schema";

export class ReportFilterDto {

    @IsOptional()
    @Validate(EntryExistsRule,
        [
            User.name,
            ({ curator_orcid }) => { return { orcid_id: curator_orcid } }
        ])
    curator_orcid?: string;

    @IsOptional()
    @Validate(EntryExistsRule,
        [
            PartnerResource.name,
            ({ resource_id }) => { return { resource_id } }
        ])
    resource_id?: string

    @IsOptional()
    @ValidateIf(o => o.activity_terms.length > 0)
    @Validate(EntryExistsRule, [
        Term.name,
        ({ activity_terms, resource_id }) => {
            if (resource_id) {
                return { activity_term: { $in: activity_terms }, resource_id }
            }
            return { activity_term: { $in: activity_terms } }
        }
    ])
    activity_terms?: string[] = []


    @IsOptional()
    entity_uri?: string

    // @Transform(({ value, obj }) => !obj.from && !obj.to ? 10 : value )
    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Max(50)
    page_size?: number

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = 1


    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date(), { message: 'maximal allowed date for $property is the current Date' })
    @Validate(DateBefore, ['to'])
    from?: Date


    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @MaxDate(() => new Date(), { message: 'maximal allowed date for $property is the current Date' })
    @Validate(DateAfter, ['from'])
    to?: Date


    @IsOptional()
    @IsIn(['timestamp', 'resource_id', 'entity_uri', 'curator_orcid', 'activity_term'])
    sortBy?: 'timestamp' | 'resource_id' | 'entity_uri' | 'curator_orcid' | 'activity_term' = 'timestamp'

    @IsOptional()
    @IsIn(['asc', 'desc', -1, 1])
    sortOrder?: 'asc' | 'desc' | 1 | -1 = 'desc'




}

export class ReportFilterGroupBy {
    @IsOptional()
    @IsIn(['day', 'month', 'activity_term'])
    groupBy: 'day' | 'month' | 'activity_term'
}