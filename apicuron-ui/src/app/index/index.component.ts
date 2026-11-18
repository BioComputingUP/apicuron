import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { ResourcesService } from "../resource/service/resources.service";

/** One kind of output APICURON credits; icon is an SVG path in a 24×24 box */
interface TrackedOutput {
  name: string;
  description: string;
  icon: string;
}

/** a complete ORCID iD, e.g. 0000-0002-1825-0097 */
const ORCID_ID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class IndexComponent {
  resources$: Observable<Resource[]>;

  searchText = "";

  /** Data stands for the Database and Knowledge Base resource categories */
  readonly trackedOutputs: TrackedOutput[] = [
    {
      name: "Data",
      description:
        "Curation and annotation of database and knowledge base entries",
      icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    },
    {
      name: "Software",
      description: "Research code, packages and documentation",
      icon: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
    },
    {
      name: "Training",
      description: "Training materials and courses",
      icon: "M2 9l10-5 10 5-10 5-10-5zm4 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6",
    },
  ];

  constructor(
    protected resourceService: ResourcesService,
    private router: Router
  ) {
    this.resources$ = this.resourceService.getAllResources();
  }

  /** opens the profile for a full ORCID iD (names are the only searched field), otherwise searches names */
  searchContributors() {
    const text = this.searchText.trim();
    if (ORCID_ID.test(text)) {
      this.router.navigate(["/contributors", text.toUpperCase()]);
    } else {
      this.router.navigate(["/contributors"], {
        queryParams: text ? { search: text } : {},
      });
    }
  }
}
