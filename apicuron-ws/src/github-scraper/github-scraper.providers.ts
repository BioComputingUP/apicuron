import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface GithubScraperModuleOptions {
	github_token: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<GithubScraperModuleOptions>().build();
