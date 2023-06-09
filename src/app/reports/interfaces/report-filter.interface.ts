
export interface ReportFilter {

    curator_orcid?: string;

    resource_id?: string

    activity_term?: string

    entity_uri?: string

    page_size?: number

    page?: number

    from?: Date

    to?: Date

    sortBy?: 'timestamp' | 'resource_id' | 'entity_uri' | 'curator_orcid' | 'activity_term'

    sortOrder?: 'asc' | 'desc' | 1 | -1

    groupBy?: 'date' | 'activity_term'

}