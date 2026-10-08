const { resolve } = require('path');
export default () => ({
	environment: 'local', // The name of the environment displayed on the logs on startup
	db_host: process.env.DATABASE_HOST || 'moros', // the hostname of the mongodb instance to use

	database: process.env.DATABASE || 'apicuron_test', // the name of the database on mongodb
	db_port: parseInt(process.env.DB_PORT ?? '27017'), // the port that the database uses
	ORCID_REDIRECT: 'http://localhost:3000/auth/orcid/redirect', // The assigned Redirect URL for ORCID
	ORCID_CLIENT_ID: 'APP-TTBI2EX11P70SRD6', // the client ID registered on
	ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET', // the secret used when communicating with ORCID
	ORCID_AUTH_URL: 'https://sandbox.orcid.org/oauth/authorize', // The ORCID authentication URL
	ORCID_TOKEN_URL: 'https://sandbox.orcid.org/oauth/token', // The ORCID Token url
	JWT_SECRET: 'secret', // The key to used to verify JWT issued tokens
	PORT: 3000, // The port on which the API is served
	HOST: '0.0.0.0', // Host that the API is served on
	ORCID_API_URL: 'https://pub.sandbox.orcid.org/v3.0/', // THE Url of the ORCID API used (in this case the sandbox API)
	JWT_HEADER: 'authorization', // The header of the Authorization token required for jwt authentication
	JWT_PREFIX: 'bearer', // The prefix of the auth token
	V1_HOST: 'http://localhost:8198/', // Apicuron first version host location
	PUBLIC_FILES_URL_PATH: '/public', // The URL under which public files are served
	PUBLIC_FILES_PATH: resolve(__dirname, '../../public'), // __dirname resolves to current file directory (the path of the public files)
	PRIVATE_FILES_PATH: resolve(__dirname, '../../private'), // path of the private files not publicly served
	FRONTEND_HOST: 'http://localhost:4200/', // The host of the frontend using this
	SCHEDULER: 'https://dev.scheduler.biocomputingup.it/job/', // The url of the scheduler used ()
	SCHEDULER_TASK: 'apicuron_dev', // The task used by APICURON on this scheduler
	API_DOCS_PREFIX: '',
	RELEASE: '2.0.0',
	GITHUB_TOKEN: process.env.GITHUB_TOKEN,
});
