import { resolve } from 'path'
export default () => ({
  environment: 'local',
  db_host: process.env.DATABASE_HOST || 'moros',
  database: process.env.DATABASE || 'apicuron_test',
  db_port: parseInt(process.env.DB_PORT) || 27017,
  ORCID_REDIRECT: 'http://localhost:3000/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-TTBI2EX11P70SRD6',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'local',
  JWT_SECRET: 'secret',
  PORT: 3000,
  HOST: '0.0.0.0',
  ORCID_API_URL: 'https://pub.sandbox.orcid.org/v3.0/',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8198/', // Apicuron first version host location
  PUBLIC_FILES_URL_PATH: '/public',
  PUBLIC_FILES_PATH: resolve(__dirname, "../../public"), // __dirname resolves to current file directory
  PRIVATE_FILES_PATH: resolve(__dirname, "../../private"),
  FRONTEND_HOST: 'http://localhost:4200/'
});
