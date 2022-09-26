export default () => ({
  environment: 'production',
  database_url: 'mongodb://moros:27017/apicuron_test',
  ORCID_REDIRECT: 'https://beta.apicuron.org/api/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-IU0CU8PQW4VDZA84',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'development',
  JWT_SECRET: 'secret',
  PORT: 8298,
  HOST: 'localhost',
  ORCID_API_URL:'https://pub.orcid.org/v3.0/',
  PUBLIC_FILES_PATH: '/var/local/webservers/apps/apicuron2/public',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8198/', // Apicuron first version host location
  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
