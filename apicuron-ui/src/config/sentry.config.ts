import { enableProdMode } from "@angular/core";
import { APP_INITIALIZER, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
// Sentry setup
import * as Sentry from "@sentry/angular-ivy";

export function setupSentry() {
  if (environment.production) {
    const propagationTargets = [
      "http://localhost:3000",
      "https://dev.apicuron.org/api",
      "https://apicuron.org/api",
    ].map((url: string) => {
      return new RegExp("^" + url + "*");
    });

    Sentry.init({
      dsn: "https://5f0308b709e84f57ab7287cca3cf474c@o4505266554470400.ingest.sentry.io/4505266560040960",
      integrations: [
        new Sentry.BrowserTracing({
          // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
          tracePropagationTargets: propagationTargets,
          routingInstrumentation: Sentry.routingInstrumentation,
        }),
        new Sentry.Replay(),
      ],

      // specify environment
      environment: environment.env,

      // Performance Monitoring
      tracesSampleRate: 0.5, // Capture 100% of the transactions, reduce in production!
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
  }
}

export const SentryModuleConfig = environment.production
  ? [
      {
        provide: ErrorHandler,
        useValue: Sentry.createErrorHandler({
          showDialog: false,
        }),
      },
      {
        provide: Sentry.TraceService,
        deps: [Router],
      },
      {
        provide: APP_INITIALIZER,
        useFactory: () => () => {},
        deps: [Sentry.TraceService],
        multi: true,
      },
    ]
  : [];
