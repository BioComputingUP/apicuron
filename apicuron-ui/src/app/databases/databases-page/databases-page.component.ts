import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Resource } from "../../models/resource.model";
import { ResourcesService } from "../../resource/service/resources.service";
import { shareReplay } from "rxjs/operators";

@Component({
  selector: "app-databases",
  templateUrl: "./databases-page.component.html",
  styleUrls: ["./databases-page.component.scss"],
})
export class DatabasesPageComponent {
  listResourcesDescriptions;

  constructor(private resourceService: ResourcesService) {
    this.resources$ = this.resourceService
      .getAllResources()
      .pipe(shareReplay());
  }

  resources$: Observable<Resource[]>;
}
