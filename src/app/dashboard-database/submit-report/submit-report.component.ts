import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap, tap } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";

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
  resource_data$: Observable<any>;
  resource$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabasesService,
  ) {
    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id");
      })
    );

    this.resource_data$ = this.resource_id$.pipe(
      switchMap((resource_id: string) => {
        return this.databaseService.get_resource(resource_id);
      }),
      shareReplay()
    );

    this.resource$ = this.resource_data$.pipe(pluck("data"));
  }

  ngOnInit(): void {

  }

}
