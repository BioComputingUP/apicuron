import devConfig from './configuration.dev';
import prodConfig from './configuration.prod';
import prodTemp from './configuration.temp'

export function loadConfig () {
	if (process.env.NODE_ENV === 'development') {
		return devConfig;
	}
	if (process.env.NODE_ENV === 'production') {
		return prodConfig;
	}

	if (process.env.NODE_ENV === 'prod_temp') {
		return prodTemp;
	}
	return devConfig;
}