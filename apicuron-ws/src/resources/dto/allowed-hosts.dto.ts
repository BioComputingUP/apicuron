import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayMaxSize,
	IsArray,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';

export const MAX_ALLOWED_HOSTS = 20;

export class UpdateAllowedHostsDto {
	@ApiPropertyOptional({
		description:
			'https URLs whose host is added to the hosts allowed in the entity_uri of reports, e.g. https://www.disprot.org',
		type: [String],
	})
	@IsUrl(
		{
			protocols: ['https'],
			require_protocol: true,
			// rejects localhost and wildcards
			require_tld: true,
			disallow_auth: true,
			// rejects IPv4 and IPv6 addresses
			host_blacklist: [/^[\d.]+$/, /:/],
		},
		{
			each: true,
			message:
				'add must only contain https URLs with a domain name, e.g. https://www.disprot.org',
		},
	)
	@ArrayMaxSize(MAX_ALLOWED_HOSTS)
	@IsArray()
	@IsOptional()
	add?: string[];

	@ApiPropertyOptional({
		description:
			'Hosts or URLs removed from the allowed hosts, e.g. doi.org or https://doi.org',
		type: [String],
	})
	@MaxLength(2048, { each: true })
	@IsString({ each: true })
	@ArrayMaxSize(MAX_ALLOWED_HOSTS)
	@IsArray()
	@IsOptional()
	remove?: string[];
}
