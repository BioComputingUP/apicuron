


export function loadConfig () {

	const config_name = {
		'local': 'local',
		'prod': 'prod',
		'production': 'prod',
		'dev': 'dev',
		'development': 'dev'
	}

	const configName = config_name[process.env.NODE_ENV] || process.env.NODE_ENV

	return require(`../../env/config.${configName}`);

}