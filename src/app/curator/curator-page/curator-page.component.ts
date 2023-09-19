import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { DatabasesService } from "../../databases/services/databases.service";
import {
  CuratorPageService,
  StatisticsWithResource,
} from "./curator-page.service";
import { environment } from "../../../environments/environment";
import { User } from "src/app/models/User.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { Resource } from "src/app/models/resource.model";

@Component({
  selector: "app-curator-page",
  templateUrl: "./curator-page.component.html",
  styleUrls: ["./curator-page.component.scss"],
})
export class CuratorPageComponent implements OnInit {
  curator$: Observable<User>;
  orcidId$: Observable<string>;
  // statsWithResource$: Observable<StatisticsWithResource[]>;
  statistics$: Observable<CuratorStatistics[]>;

  constructor(
    private route: ActivatedRoute,
    private curatorPageService: CuratorPageService
  ) {}

  ngOnInit() {
    this.orcidId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("orcid_id");
      })
    );
    this.curatorPageService.init(this.orcidId$);
    this.curator$ = this.curatorPageService.getCurator();
    this.statistics$ = this.curatorPageService.getStatistics();
  }
}
