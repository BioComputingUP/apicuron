
import { loadConfig } from "../config/load"

const env: Function = loadConfig()
const {
    JWT_HEADER,
    JWT_PREFIX
} = env()

export const VersionHeader = {
	name: 'version',
	description: 'The header describing the API version, default version is 2',
    allowEmptyValue: false,
    default: '2'
}

export const AuthorizationHeader = {
    name: JWT_HEADER,
    description: 'A header that contains the user JWT key prefixed with ' + JWT_PREFIX,
    allowEmptyValue: false   
}