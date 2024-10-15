import { AfterViewInit, Component, Input } from "@angular/core";
import { Resource } from "../../../../../src/app/models/resource.model";
import { BehaviorSubject, Observable } from "rxjs";
import { ResourcesService } from "../resource";
import { ResourceLeaderboardService } from "./services/resource-leaderboard.service";
import { LeaderboardOptions, LeaderboardParsedOption } from "./interfaces/leaderboard-options";
import { defaultLeaderboardOptions } from "./constants";

@Component({
  selector: "resource-leaderboard",
  templateUrl: "./resource-leaderboard.component.html",
})
export class ResourceLeaderboardComponent implements AfterViewInit {
  resource$: Observable<Resource>;
  options$: BehaviorSubject<LeaderboardParsedOption[]>;
  selectedOption$: BehaviorSubject<LeaderboardParsedOption>;
  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: ResourceLeaderboardService
  ) {
    const parsedOptions = this.leaderboardService.parseOptions(
      defaultLeaderboardOptions
    );
    this.options$ = new BehaviorSubject(parsedOptions);
    this.selectedOption$ = new BehaviorSubject<LeaderboardParsedOption>(parsedOptions[0]);
  }
  @Input("resource") set resource(value: Resource | string) {
    this.resource$ = this.resourceService.loadResource(value);
  }

  ngAfterViewInit(): void {}

  selectLeaderboard(option: LeaderboardParsedOption): void {
    this.selectedOption$.next(option);
  }

  @Input("options") set options(value: LeaderboardOptions) {
    this.options$.next(this.leaderboardService.parseOptions(value));
  }
}
