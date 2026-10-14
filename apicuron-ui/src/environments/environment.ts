// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { APP_CONSTANTS } from "src/constants";

export const environment = {
  constants: APP_CONSTANTS,
  production: false,
  env: "local",
  domain: 'localhost',
  host: "http://localhost:3000",
  ws: "/api",
  auth_ws: "http://localhost:3000/api",
  public_file_url: "http://localhost:3000/api/files",
  resource_logo_path: "resources",
  orcid_url: "https://pub.sandbox.orcid.org/v3.0/",
  orcid_main_url: "https://sandbox.orcid.org/",
  fairsharing_url: "https://fairsharing.org",
  bip_url: "https://bip.imsi.athenarc.gr/scholar",
  bip_scholar_api_url: "https://bip-api.imsi.athenarc.gr/scholar/scores",

  // ws: 'https://apicuron.bio.unipd.it/api/'
  // ws: 'http://localhost:8098/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
