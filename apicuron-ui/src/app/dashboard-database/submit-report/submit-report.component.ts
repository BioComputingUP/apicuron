import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap, tap } from "rxjs/operators";
import { Resource } from "src/app/models/resource.model";
import { ResourcesService } from "src/app/resource/service/resources.service";

@Component({
  selector: "app-submit-report",
  templateUrl: "./submit-report.component.html",
  styleUrls: ["./submit-report.component.scss"],
  host: {
    class: 'tw-flex-auto'
  }
})
export class SubmitReportComponent implements OnInit {
  resource_id$: Observable<string>;
  resource$: Observable<Resource>;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesService,
  ) {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );


    this.resource$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.resourceService.get_resource(resource_id)
      })
    )
  }

  ngOnInit(): void {

  }

}
