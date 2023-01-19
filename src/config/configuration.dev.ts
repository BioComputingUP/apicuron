import { resolve } from "path";

export default () => ({
  environment: 'development',
  db_host: process.env.DATABASE_HOST || 'moros',
  database: process.env.DATABASE || 'apicuron_test',
  db_port: process.env.DB_PORT || 27017,
  ORCID_REDIRECT: 'https://dev.apicuron.org/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-IU0CU8PQW4VDZA84',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'development',
  JWT_SECRET: 'secret',
  PORT: parseInt(process.env.PORT) || 8198,
  HOST: process.env.HOST || '0.0.0.0',
  ORCID_API_URL: 'https://pub.sandbox.orcid.org/v3.0/',
  PUBLIC_FILES_PATH: resolve('public'),
  PRIVATE_FILES_PATH: resolve('private'),
  PUBLIC_FILES_URL_PATH: '/public',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8298/', // Apicuron first version host location
  FRONTEND_HOST: 'http://dev.apicuron.org/'

  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
