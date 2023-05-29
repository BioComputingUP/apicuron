import { resolve, join } from "path";

export default () => ({
  environment: 'production',
  db_host: process.env.DATABASE_HOST || 'moros',
  database: process.env.DATABASE || 'apicuron',
  db_port: parseInt(process.env.DB_PORT) ||27017,
  ORCID_REDIRECT: 'https://apicuron.org/api/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-AVABS99G54THO0UW',
  ORCID_CLIENT_SECRET: '**REMOVED**',
  ORCID_AUTH_URL: 'https://orcid.org/oauth/authorize',
  ORCID_TOKEN_URL: 'https://orcid.org/oauth/token',
  ENV_NAME: 'production',
  JWT_SECRET: 'secret',
  PORT: parseInt(process.env.PORT) || 8098,
  HOST: '0.0.0.0',
  ORCID_API_URL: 'https://pub.orcid.org/v3.0/',
  PUBLIC_FILES_PATH: resolve(__dirname, "../../public"), // __dirname resolves to current file directory
  PRIVATE_FILES_PATH: resolve(__dirname, "../../private"),
  PUBLIC_FILES_URL_PATH: '/public',
  JWT_HEADER: 'authorization',
  JWT_PREFIX: 'bearer',
  V1_HOST: 'http://localhost:8298/', // Apicuron first version host location
  FRONTEND_HOST: 'http://apicuron.org/',
  SCHEDULER: 'https://scheduler.biocomputingup.it/task/',
  SCHEDULER_TASK: 'apicuron_tasks',
  API_DOCS_PREFIX: 'api/'
  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
