import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Resource } from "../models/resource.model";
import { ResourceOutputTypes } from "../models/types/enums";
import { ResourcesService } from "../resource/service/resources.service";

/** One kind of output APICURON credits; icon is an SVG path in a 24×24 box */
interface TrackedOutput {
  name: string;
  description: string;
  icon: string;
  /** the output type's page on the NTO registry */
  link: string;
}

/** an output type filter chip (Data, Software, Training); null is "All" */
interface CategoryChip {
  category: string | null;
  label: string;
  count: number;
}

/** what the partner resources section shows */
interface ResourceBrowser {
  chips: CategoryChip[];
  shown: Resource[];
  total: number;
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

  /** partner resource filters: category chip and name search */
  readonly category$ = new BehaviorSubject<string | null>(null);
  readonly resourceQuery$ = new BehaviorSubject<string>("");
  browser$: Observable<ResourceBrowser>;

  /** Data stands for the Database and Knowledge Base resource categories */
  readonly trackedOutputs: TrackedOutput[] = [
    {
      name: "Data",
      link: "https://nto-registry.org/registry/?category=Data",
      description:
        "Curation and annotation of database and knowledge base entries",
      icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    },
    {
      name: "Software",
      link: "https://nto-registry.org/registry/?category=Software",
      description: "Research code, packages and documentation",
      icon: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
    },
    {
      name: "Training",
      link: "https://nto-registry.org/registry/?category=Training",
      description: "Training materials and courses",
      icon: "M2 9l10-5 10 5-10 5-10-5zm4 2v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6",
    },
  ];

  constructor(
    protected resourceService: ResourcesService,
    private router: Router
  ) {
    // one request for the resource grid and the numbers band
    this.resources$ = this.resourceService.getAllResources().pipe(shareReplay(1));

    this.browser$ = combineLatest([
      this.resources$,
      this.category$,
      this.resourceQuery$,
    ]).pipe(
      map(([resources, category, query]) => ({
        chips: toChips(resources),
        shown: resources.filter(
          (r) =>
            (category === null || r.outputType() === category) &&
            matchesName(r, query)
        ),
        total: resources.length,
      }))
    );
  }

  clearResourceFilters() {
    this.category$.next(null);
    this.resourceQuery$.next("");
  }

  trackResource(_index: number, resource: Resource) {
    return resource.resource_id;
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

/** "All" then one chip per output type that has resources */
function toChips(resources: Resource[]): CategoryChip[] {
  const outputTypes = [...new Set(Object.values(ResourceOutputTypes))];
  const perCategory = outputTypes.map((outputType) => ({
    category: outputType,
    label: outputType,
    count: resources.filter((r) => r.outputType() === outputType).length,
  })).filter((chip) => chip.count > 0);
  return [{ category: null, label: "All", count: resources.length }, ...perCategory];
}

/** case-insensitive match on the short or long name */
function matchesName(resource: Resource, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return [resource.resource_name, resource.resource_long_name].some((name) =>
    (name ?? "").toLowerCase().includes(q)
  );
}
