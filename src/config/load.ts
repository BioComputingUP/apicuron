import devConfig from './configuration.dev';
import prodConfig from './configuration.prod';

export function loadConfig () {
	if (['development', 'dev'].includes(process.env.NODE_ENV)) {
		return devConfig;
	}
	if (['production', 'prod'].includes(process.env.NODE_ENV)) {
		return prodConfig;
	}

	process.env.NODE_ENV= 'development'
	return devConfig;
}