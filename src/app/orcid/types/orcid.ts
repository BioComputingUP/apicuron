export type OrcidProfileLink = {
    name: string
    url: URL,
    error?: any
}
export type OrcidInformation = {
    keywords?: string[]
    profileLinks?: OrcidProfileLink[],
    biography?: string,
    employment?: string,
}