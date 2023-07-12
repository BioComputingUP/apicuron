import { Component, Input, OnInit } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, shareReplay, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/models/User.model";
import { ResourcesService } from "src/app/resource/service/resources.service";
import { Resource } from "src/app/models/resource.model";
@Component({
  selector: "dashboard-sidebar",
  templateUrl: "./dashboard-sidebar.component.html",
  styleUrls: ["./dashboard-sidebar.component.scss"],
})
export class DashboardSidebarComponent implements OnInit {
  links$: Observable<
    {
      links: { href: string[]; name: string; icon: string }[]; // extract managed resources from user and request their data
      resource: Resource
    }[]
  >;
  user$: Observable<User>;
  resources$: Observable<Resource[]>;

  constructor(
    protected auth: AuthService,
    protected resourceService: ResourcesService
  ) {
    this.user$ = this.auth.user$;

    this.resources$ = this.user$.pipe(
      // extract managed resources from user and request their data
      map((user: User) => {
        const resourceIds = user.resources.map(
          (resource) => resource.resource_id
        );
        return resourceIds.map((resource_id) =>
          this.resourceService.get_resource(resource_id).pipe(shareReplay(1))
        );
      }),
      // Combine these resources into a single observable array
      switchMap((resources: Observable<Resource>[]) => {
        return combineLatest(resources);
      })
    );

    this.links$ = this.resources$.pipe(
      map((resources: Resource[]) => {
        return resources.map((resource: Resource) => {

          return {
            resource,
            links: [
              {
                href: ["/dashboard", "database", resource.resource_id],
                name: `Overview`,
                icon: "assets/svg/overview.svg",
              },
              {
                href: ["/dashboard", "database", resource.resource_id, "edit"],
                name: `Edit ${resource.resource_name}`,
                icon: "assets/svg/pencil.svg",
              },
              {
                href: ["/dashboard", "database", resource.resource_id, "terms"],
                name: `Manage ${resource.resource_name} Terms`,
                icon: "assets/svg/settings.svg",
              },
              {
                href: [
                  "/dashboard",
                  "database",
                  resource.resource_id,
                  "reports",
                ],
                name: "Submit Reports",
                icon: "assets/svg/document-text.svg",
              },
              {
                href: [
                  "/dashboard",
                  "database",
                  resource.resource_id,
                  "medals",
                ],
                name: "Manage Medals",
                icon: "assets/medal_icon.svg",
              },
              {
                href: [
                  "/dashboard",
                  "database",
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

  // @Input('resource') resource$: Observable<any>;
  mobile_toggle = false;

  minimized = false;

  logo_src(logo: string) {
    if (logo.startsWith("assets")) {
      return logo;
    } else {
      return new URL(
        logo
          .split("/")
          .filter((el) => el)
          .join("/"),
        environment.ws + "/"
      );
    }
  }

  ngOnInit(): void {}
}
