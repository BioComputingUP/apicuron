export type OrcidProfileLink = {
    name: string
    value: URL
}
export type OrcidInformation = {
    keywords?: string[]
    profileLinks?: OrcidProfileLink[],
    biography?: string,
    employment?: string,
}