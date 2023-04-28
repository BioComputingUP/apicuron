import { resolve, join } from "path";

export default () => ({
  environment: 'production',
  db_host: process.env.DATABASE_HOST || 'moros',
  database: process.env.DATABASE || 'apicuron',
  db_port: parseInt(process.env.DB_PORT) ||27017,
  ORCID_REDIRECT: 'https://apicuron.org/api/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-8DYAPJ0ILQR63XA4',
  ORCID_CLIENT_SECRET: '220749aa-aa6a-4284-a2c4-4c5509407917',
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
  SCHEDULER_TASK: 'apicuron_tasks'
  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
