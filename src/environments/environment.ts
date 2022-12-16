// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'http://localhost:4200',
  ws: 'http://localhost:3000',
  auth_ws: 'http://localhost:3000',
  public_file_url: 'http://dione:3000/files',
  resource_logo_path: 'resources',
  orcid_url: 'https://pub.sandbox.orcid.org/v3.0/'
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
