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
	if (process.env.NODE_ENV === 'production') {
		return prodConfig;
	}

	return localConfig;
}