import { enableProdMode } from "@angular/core";
import { APP_INITIALIZER, ErrorHandler } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
// Sentry setup
import * as Sentry from "@sentry/angular";

const isTesting: boolean = false;
const isProduction = environment.production || isTesting;

export function setupSentry() {
  if (!isProduction) {
    return;
  }
  Sentry.init({
    dsn: "https://2289a6ec461a4b2d99b7291fd3f1d97b@sentry.biocomputingup.it/2",
    integrations: [],
    // specify environment
    environment: environment.env,
  });
}

export const SentryModuleConfig = isProduction
  ? [
      {
        provide: ErrorHandler,
        useValue: Sentry.createErrorHandler({
          showDialog: false, // false Until this is resolved & released: https://gitlab.com/glitchtip/glitchtip-backend/-/work_items/468
        }),
      },
    ]
  : [];
