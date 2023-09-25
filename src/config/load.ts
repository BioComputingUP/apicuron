// import dev from '../../env/config.dev'
// import local from '../../env/config.local'
// import prod from '../../env/config.prod'

export function loadConfig () {

	// const config_name = {
	// 	'local': local,
	// 	'prod': prod,
	// 	'production': prod,
	// 	'dev': dev,
	// 	'development': dev
	// }
	const configNames = {
		'dev': 'dev',
		'development': 'dev',
		'local': 'local',
		'prod': 'prod',
		'production': 'prod',
	}

	const configName = configNames[process.env.NODE_ENV] || process.env.NODE_ENV || 'local'

	const config = require(`./config.${configName}`)

	return config.default
}