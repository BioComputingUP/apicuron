import { Component, Input } from "@angular/core";
import { Resource } from "../../../../../src/app/models/resource.model";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
} from "rxjs";
import { ResourcesService } from "../resource";
import { ResourceLeaderboardService } from "./services/resource-leaderboard.service";
import {
  LeaderboardOptions,
  LeaderboardParsedOption,
} from "./interfaces/leaderboard-options";
import { defaultLeaderboardOptions } from "./constants";

@Component({
  selector: "resource-leaderboard",
  templateUrl: "./resource-leaderboard.component.html",
})
export class ResourceLeaderboardComponent {
  options$: BehaviorSubject<LeaderboardParsedOption[]>;
  selectedOption$: BehaviorSubject<LeaderboardParsedOption>;

  resource$ = new ReplaySubject<Resource>();
  data$: Observable<
    [Resource, LeaderboardParsedOption[], LeaderboardParsedOption]
  >;
  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: ResourceLeaderboardService
  ) {
    const parsedOptions = this.leaderboardService.parseOptions(
      defaultLeaderboardOptions
    );
    this.options$ = new BehaviorSubject(parsedOptions);
    this.selectedOption$ = new BehaviorSubject<LeaderboardParsedOption>(
      parsedOptions[0]
    );

    this.data$ = combineLatest([
      this.resource$,
      this.options$,
      this.selectedOption$,
    ]);
  }

  selectLeaderboard(option: LeaderboardParsedOption): void {
    this.selectedOption$.next(option);
  }
  @Input("resource") set resource(value: Resource | string) {
    this.resourceService.loadResource(value).subscribe(this.resource$);
  }

  @Input("options") set options(value: LeaderboardOptions) {
    this.options$.next(this.leaderboardService.parseOptions(value));
  }
}
