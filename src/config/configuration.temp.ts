export default () => ({
  environment: 'procution_temp',
  db_host: 'moros',
  database: 'apicuron_test',
  db_port: 27017,
  ORCID_REDIRECT: 'https://dev.apicuron.org/api/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-TTBI2EX11P70SRD6',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'production_temp',
  JWT_SECRET: 'secret',
  PORT: 3000,
  HOST: '0.0.0.0',
  ORCID_API_URL: 'https://pub.sandbox.orcid.org/v3.0/',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8198/', // Apicuron first version host location
  PUBLIC_FILES_PATH: '/var/local/webservers/apps/apicuron2/public',
  FRONTEND_HOST: 'http://dev.apicuron.org/'  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
