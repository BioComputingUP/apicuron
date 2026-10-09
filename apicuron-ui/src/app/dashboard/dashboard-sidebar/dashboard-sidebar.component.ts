import { Component, Input, OnInit } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/models/User.model";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { Resource } from "src/app/models/resource.model";
import { ActivatedRoute } from "@angular/router";
import { DashboardService } from "../services/dashboard.service";

type ResourceLinks = {
  links: { href: string[]; name: string; icon: string }[]; // extract managed resources from user and request their data
  resource: Resource
};
@Component({
  selector: "dashboard-sidebar",
  templateUrl: "./dashboard-sidebar.component.html",
  styleUrls: ["./dashboard-sidebar.component.scss"],
})
export class DashboardSidebarComponent implements OnInit {
  links$: Observable<
    ResourceLinks[]
  >;
  user$: Observable<User>;
  managedResources$: Observable<Resource[]>;
  contributedResources$: Observable<Resource[]>;

  constructor(
    protected dashboardService: DashboardService,
    // protected auth: AuthService,
    // protected resourceService: ResourcesService,
    protected route: ActivatedRoute
  ) {
    this.user$ = this.dashboardService.user$;

    this.managedResources$ = this.dashboardService.managedResources$;

    this.contributedResources$ = this.dashboardService.contributedResources$;

    this.links$ = this.managedResources$.pipe(
      map((resources: Resource[]) => {
        return resources.map((resource: Resource) => {

          return {
            resource,
            links: [
              {
                href: ["/dashboard", "resource", resource.resource_id],
                name: `Overview`,
                icon: "assets/svg/overview.svg",
              },
              {
                href: ["/dashboard", "resource", resource.resource_id, "edit"],
                name: `Edit ${resource.resource_name}`,
                icon: "assets/svg/pencil.svg",
              },
              {
                href: ["/dashboard", "resource", resource.resource_id, "groups"],
                name: `Manage ${resource.resource_name} Groups`,
                icon: "assets/svg/groups.svg",
              },
              {
                href: ["/dashboard", "resource", resource.resource_id, "terms"],
                name: `Manage ${resource.resource_name} Activities`,
                icon: "assets/svg/settings.svg",
              },
              {
                href: [
                  "/dashboard",
                  "resource",
                  resource.resource_id,
                  "reports",
                ],
                name: "Submit Reports",
                icon: "assets/svg/document-text.svg",
              },
              {
                href: [
                  "/dashboard",
                  "resource",
                  resource.resource_id,
                  "medals",
                ],
                name: "Manage Medals",
                icon: "assets/medal_icon.svg",
              },
              {
                href: [
                  "/dashboard",
                  "resource",
                  resource.resource_id,
                  "badges",
                ],
                name: "Manage Badges",
                icon: "assets/badge_icon.svg",
              },
            ],
          };
        });
      })
    );
  }

  openDetails(resourceLinks: ResourceLinks) {
    const currentUrl = this.route.snapshot.pathFromRoot.map((snap) => snap.url).join('/')
    return resourceLinks.links.some((link) => currentUrl.startsWith(link.href.join('/')))
  }

  // @Input('resource') resource$: Observable<any>;
  mobile_toggle = false;

  minimized = false;

  logo_src(logo: string) {
    if (logo.startsWith("assets")) {
      return logo;
    } else {
      const path = logo
        .split("/")
        .filter((el) => el)
        .join("/");
      return `${environment.ws}/${path}`

    }
  }

  ngOnInit(): void { }
}
