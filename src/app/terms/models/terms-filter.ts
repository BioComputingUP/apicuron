


export class TermsFilter {
    resource_id?: string

    activity_category?: 'generation' | 'invalidation' | 'revision'

    activity_name?: string;

    skip?: number;
    limit?: number;
}