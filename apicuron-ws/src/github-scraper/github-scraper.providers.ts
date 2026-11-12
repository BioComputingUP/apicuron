import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface GithubScraperModuleOptions {
	/** Without it, the fetch-orcid endpoint rejects every request. */
	github_token?: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<GithubScraperModuleOptions>().build();
