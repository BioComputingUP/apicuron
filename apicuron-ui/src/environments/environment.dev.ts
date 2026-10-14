import { APP_CONSTANTS } from "src/constants";

export const environment = {
  constants: APP_CONSTANTS,
  production: true,
  env: "development",

  // ws: window.location.protocol + '//' + window.location.hostname + '/api/',
  domain: "dev.apicuron.org",
  host: "https://dev.apicuron.org",
  ws: "/api",
  auth_ws: "https://dev.apicuron.org/api",
  public_file_url: "https://dev.apicuron.org/api/files",
  resource_logo_path: "resources",
  orcid_url: "https://pub.sandbox.orcid.org/v3.0/",
  orcid_main_url: "https://sandbox.orcid.org/",
  fairsharing_url: "https://fairsharing.org",
  bip_url: "https://bip.imsi.athenarc.gr/scholar",
  bip_scholar_api_url: "https://bip-api.imsi.athenarc.gr/scholar/scores",
};
