export type OrcidProfileLink = {
    name: string
    value: URL
    host: string;
    error?: any;
}
export type OrcidInformation = {
    keywords?: string[]
    profileLinks?: OrcidProfileLink[],
    biography?: string,
    employment?: string,
}