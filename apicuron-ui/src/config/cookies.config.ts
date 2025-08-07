import { NgcCookieConsentConfig } from "ngx-cookieconsent";
import { environment } from "src/environments/environment";

export const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: environment.domain,
  },
  position: "top-left",
  palette: {
    popup: {
      background: "#000",
    },
    button: {
      background: "#9A031E",
    },
  },
  theme: "classic",
  type: "opt-in",
  content: {
    header: "APICURON Cookie Consent",
    message:
      "APICURON uses cookies to ensure you get the best experience on our website.",
    allow: "Allow cookies",
    deny: "Decline",
    link: "Learn more",
    policy: "Privacy Policy",
    href: environment.host + "/about#privacy", // Link to your cookie policy
  },
};
