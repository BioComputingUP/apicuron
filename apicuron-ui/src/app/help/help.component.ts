import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"],
})
export class HelpComponent implements OnInit {

  constants = environment.constants;
  navigation_panel = [
    { text: "Web interface", href: "gui" },
    { text: "API", href: "api" },
    { text: "Widget", href: "widget" },
    { text: "Open Collaboration and Feedback", href: "feedback" },
  ];
  codeWidget = `<apicuron-widget database="disprot"></apicuron-widget>
<script type="text/javascript" src="https://apicuron.org/assets/apicuron-widget.js"></script>`;

  wsname = environment.ws + "/";
  curator_orcid = "0000-0002-0341-4888";
  resource_uri = "https://registry.identifiers.org/registry/disprot";
  output = {};

  submit = {
    activity: {
      resource_uri: "https://registry.identifiers.org/registry/disprot",
      reports: [
        {
          activity_term: "region_first_generation",
          resource_uri: "https://registry.identifiers.org/registry/disprot",
          timestamp: "2016-08-11T09:59:17.000Z",
          curator_orcid: "0000-0002-0341-4888",
          entity_uri: "https://identifiers.org/disprot:DP00034",
        },
      ],
    },

    description: {
      resource_name: "DisProt",
      resource_uri: "https://registry.identifiers.org/registry/disprot",
      resource_url: "https://disprot.org/",
      resource_long_name: "The database of intrinsically disordered proteins",
      resource_description:
        "DisProt is a database of intrinsically disordered proteins...",
      terms_def: [
        {
          activity_term: "region_reference_first_genearation",
          activity_name: "Novel publication",
          activity_category: "generation",
          score: 50,
          description: "Added publication not available before in the database",
        },
      ],
      achievements_def: [
        {
          category: "1",
          name: "Newbie curator",
          count_threshold: 10,
          type: "badge",
          list_terms: ["region_reference_first_genearation"],
          color_code: "#055701",
        },
        {
          category: "6",
          score_relative: 1,
          name: "Best biocurator 2020",
          color: "gold",
          first_day: "2020-01-01T00:00:00.000000",
          last_day: "2020-12-31T23:59:59.000000",
          type: "medal",
          list_terms: ["region_reference_first_genearation"],
        },
      ],
    },
  };

  constructor() {}

  ngOnInit() {}

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
