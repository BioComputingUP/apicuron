import * as Sentry from '@sentry/node';
// DSN Does not have to be a secret
// https://docs.sentry.io/concepts/key-terms/dsn-explainer/
const DSN =
	'https://48b0bf75ac934ceea3f1b1ea4282b9b7@sentry.biocomputingup.it/1';

Sentry.init({
	dsn: DSN,
	environment: process.env?.NODE_ENV ?? 'production',
	// orgId: 1,
});
