import devConfig from './configuration.dev';
import prodConfig from './configuration.prod';


export function loadConfig () {
	if (process.env.NODE_ENV === 'development') {
		return devConfig;
	}
	if (process.env.NODE_ENV === 'production') {
		return prodConfig;
	}
	return devConfig;
}