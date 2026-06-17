// import dev from '../../env/config.dev'
// import local from '../../env/config.local'
// import prod from '../../env/config.prod'

import { Logger } from '@nestjs/common';

export function loadConfig() {
	const logger = new Logger(`ConfigurationLoader`);
	// const config_name = {
	// 	'local': local,
	// 	'prod': prod,
	// 	'production': prod,
	// 	'dev': dev,
	// 	'development': dev
	// }
	const configNames = {
		dev: 'dev',
		development: 'dev',
		local: 'local',
		prod: 'prod',
		production: 'prod',
	};

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const configName =
		process.env.NODE_ENV == 'test'
			? undefined
			: configNames[process.env.NODE_ENV || 'local'];
	logger.log(`Loading "${configName}" Configuration`);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const config = require(`./config.${configName}`);

	return config.default;
}
