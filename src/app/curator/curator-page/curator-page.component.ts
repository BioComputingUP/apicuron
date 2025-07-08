import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "src/app/models/User.model";
import { BipScholarStatsViewModel } from "src/app/models/external/bip-scholar.model";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { CuratorPageService } from "./curator-page.service";

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
  bipScores$: Observable<BipScholarStatsViewModel | null>;
  isOwnProfile$: Observable<boolean>;

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
    this.bipScores$ = this.curatorPageService.getBipScholarScores(
      this.orcidId$
    );
    this.isOwnProfile$ = this.curatorPageService.isOwnProfile(this.orcidId$);
    // .pipe(
    //   tap((bipScores) => {
    //     console.log("BipScholar Scores: ", bipScores.statCardViewModel());
    //   })
    // );
  }
}
