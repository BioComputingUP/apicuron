import devConfig from './configuration.dev';
import prodConfig from './configuration.prod';
import localConfig from './configuration.local'

export function loadConfig () {
	if (process.env.NODE_ENV === 'local') {
		return localConfig;
	}
	if (process.env.NODE_ENV === 'development') {
		return devConfig;
	}
	if (['production', 'prod'].includes(process.env.NODE_ENV)) {
		return prodConfig;
	}

	return localConfig;
}