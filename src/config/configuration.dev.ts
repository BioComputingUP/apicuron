export default () => ({
  environment: 'development',
  database_url: 'mongodb://moros:27017/apicuron_test',
  ORCID_REDIRECT: 'https://localhost:300/auth/orcid/redirect',
  ORCID_CLIENT_ID: 'APP-IU0CU8PQW4VDZA84',
  ORCID_CLIENT_SECRET: 'YOUR-ORCID-CLIENT-SECRET',
  ENV_NAME: 'development',
  JWT_SECRET: 'secret',
  PORT: 3000,
  HOST: 'localhost'
  //   port: parseInt(process.env.PORT, 10) || 3000,
  //   database: {
  //     host: process.env.DATABASE_HOST,
  //     port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  //   },
});
