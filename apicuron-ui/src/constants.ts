export interface TeamMember {
  name: string;
  role: string;
  title?: string;
  orcid?: string;
}

export interface ArticleReference {
  authors: string;
  title: string;
  doi: string;
}

const currentMembers: TeamMember[] = [
  {
    name: "Silvio CE Tosatto",
    role: "Principal Investigator",
    title: "Full Professor",
    orcid: "0000-0003-4525-7793",
  },
  {
    name: "Federica Quaglia",
    role: "Project & Community Manager",
    title: "PhD",
    orcid: "0000-0002-0341-4888",
  },
  {
    name: "Kamel Eddine Adel Bouhraoua",
    role: "Technical Lead & Software Developer",
    title: "PhD",
    orcid: "0000-0001-9531-6339",
  },
  {
    name: "Mehdi Zoubiri",
    role: "Software Developer",
    title: "PhD Candidate",
    orcid: "0009-0009-3602-3558",
  },
  {
    name: "Ivan Mičetić",
    role: "System Administrator & Support",
    title: "PhD",
    orcid: "0000-0003-1691-8425",
  },
];
const previousMembers: TeamMember[] = [
  {
    name: "Damiano Piovesan",
    role: "Team Leader & Software Developer",
    title: "Associate Professor",
  },
  {
    name: "András Hatos",
    role: "Web Developer",
    title: "PhD Student",
  },
  {
    name: "Daniyal Nasiri Bavil",
    role: "UI/UX Designer",
  },
];

const articles: ArticleReference[] = [
  {
    authors:
      "Bouhraoua, A., Zoubiri, M., Farrell, G., Aspromonte, M. C., Bateman, A., Hermjakob, H., Nugnes, M. V., Raciti, D., Stiffler, N., van Geest, G., Wittig, U., Yook, K., Quaglia, F., & Tosatto, S. C. E. (2026).",
    title:
      "APICURON: a reactive infrastructure for credit attribution across distributed research data ecosystems. Preprint.",
    doi: "10.48550/arXiv.2608.18958",
  },
  {
    authors:
      "Farrell, G., Alloza, E., Bouhraoua, A., Capella-Gutierrez, S., Goble, C., Hermjakob, H., Smith, A., Sufi, S., Vergoulis, T., Zoubiri, M., Quaglia, F., & Tosatto, S. C. E. (2026).",
    title:
      "Credit, recognition, and reward for non-traditional research artefacts in the Life Sciences. Preprint.",
    doi: "10.31222/osf.io/praxg_v1",
  },
  {
    authors: "Farrell, G., Quaglia, F., & Tosatto, S. (2026).",
    title:
      "Credit, recognition, and reward for non-traditional research artefacts in the Life Sciences. Poster.",
    doi: "10.5281/zenodo.21340764",
  },
  {
    authors:
      "Quaglia, F., Vergoulis, T., Maria Makaronidou, & Zoubiri, M. (2026).",
    title:
      "EVERSE Webinar: a Credit and Recognition Framework for RSEs and Trainers - recording and presentation slides.",
    doi: "10.5281/zenodo.20040681",
  },
  {
    authors:
      "Quaglia, F., Farrell, G., Sufi, S., Capella-Gutierrez, S., Alloza, E., Golobardes Vilarasau, A., Vergoulis, T., Maria Makaronidou, Hermjakob, H., Mirauta, B., Smith, A., & Tosatto, S. (2025).",
    title:
      "ELIXIR-STEERS D1.9 Strategies for enhancing the credit and recognition of research artefacts.",
    doi: "10.5281/zenodo.17076988",
  },
  {
    authors:
      "Quaglia, F., Bouhraoua, K. E. A., Farrell, G., & Tosatto, S. (2025).",
    title:
      "ELIXIR Commissioned Service Report: M3.3 Use Cases for APICURON Evaluated. Zenodo.",
    doi: "10.5281/zenodo.15789620",
  },
  {
    authors:
      "Vergoulis, T., Maria Makaronidou, Amodeo, S., Stavropoulos, T., Quaglia, F., Bouhraoua, K. E. A., Roiser, S., Garijo, D., Piovesan, D., Psomopoulos, F., Pechlivanis, N., Orfanou, A., & Bakoglidou, E. (2025).",
    title:
      "EVERSE project Deliverable: D5.1 Landscape analysis of existing rewards and mechanisms for research software and training activities.",
    doi: "10.5281/zenodo.14978474",
  },
  {
    authors:
      "Bouhraoua, A., Vergoulis, T., Makaronidou, M., Quaglia, F., & Tosatto, S. (2024).",
    title:
      "ELIXIR-STEERS Report M3.1 Strategy for inclusion of credit for research assets decided.",
    doi: "10.5281/zenodo.14017751",
  },
];

// Routed through environment to allow per-env overrides
export const APP_CONSTANTS = {
  issueTracker: "https://github.com/BioComputingUP/apicuron-issue-tracker",
  slackInvite:
    "https://join.slack.com/t/apicuron/shared_invite/zt-1jir4nfu9-gDItsCVg7f0JoY8_mOht7w",
  contactEmail: "mailto:info@apicuron.org",
  members: {
    current: currentMembers,
    previous: previousMembers,
  },
  articles,
};
