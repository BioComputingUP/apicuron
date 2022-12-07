import { resolve } from 'path'
export default () => ({
  environment: 'development',
  db_host: process.env.DB_HOST || 'moros',
  database: process.env.DB || 'apicuron_test',
  db_port: process.env.DB_PORT || 27017,
  ORCID_REDIRECT: 'http://localhost:3000/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-IU0CU8PQW4VDZA84',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'development',
  JWT_SECRET: 'secret',
  PORT: 3000,
  HOST: '0.0.0.0',
  ORCID_API_URL: 'https://pub.sandbox.orcid.org/v3.0/',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8198/', // Apicuron first version host location
  PUBLIC_FILES_URL_PATH: '/public',
  PUBLIC_FILES_PATH: resolve('public'),
  PRIVATE_FILES_PATH: resolve('private'),
  FRONTEND_HOST: 'http://localhost:4200/'
});
