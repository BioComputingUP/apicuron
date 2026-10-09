import { Component } from "@angular/core";

interface TeamMember {
  name: string;
  role: string;
  title?: string;
  orcid?: string;
}

interface RelatedArticle {
  authors: string;
  title: string;
  doi: string;
}

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent {
  protected readonly sections: { id: string; label: string }[] = [
    { id: "how-to-cite", label: "How to cite" },
    { id: "related-articles", label: "Related articles" },
    { id: "license", label: "License" },
    { id: "becomemember", label: "Become a member" },
    { id: "contact", label: "Contact" },
    { id: "team", label: "APICURON team" },
    { id: "funding", label: "Funding" },
    { id: "qa-life-cycle-plan", label: "QA life cycle plan" },
    { id: "sab", label: "Scientific Advisory Board" },
    { id: "elsi-policy", label: "ELSI policy and equal opportunity" },
    { id: "privacy", label: "Privacy notice" },
  ];

  protected readonly teamMembers: {
    current: TeamMember[];
    previous: TeamMember[];
  } = {
    current: [
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
    ],
    previous: [
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
    ],
  };

  protected readonly relatedArticles: RelatedArticle[] = [
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
  ];
}
