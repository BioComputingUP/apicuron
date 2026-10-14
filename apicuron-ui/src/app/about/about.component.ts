import { Component } from "@angular/core";
import { ArticleReference, TeamMember } from "src/constants";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent {
  constants = environment.constants;

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
  } = this.constants.members;

  protected readonly relatedArticles: ArticleReference[] =
    this.constants.articles;
}
