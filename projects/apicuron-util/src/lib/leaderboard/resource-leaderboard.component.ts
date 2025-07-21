import { Component, Input } from "@angular/core";
import { Resource } from "../../../../../src/app/models/resource.model";
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
  startWith,
  Subject,
  tap,
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
  // selectedOption$: BehaviorSubject<LeaderboardParsedOption>;

  selectOptionEvent$ = new Subject<LeaderboardParsedOption>();

  selectedOption$: Observable<LeaderboardParsedOption>;

  resource$ = new ReplaySubject<Resource>();
  data$: Observable<
    [Resource, LeaderboardParsedOption[], LeaderboardParsedOption]
  >;
  constructor(
    protected resourceService: ResourcesService,
    protected leaderboardService: ResourceLeaderboardService
  ) {
    // Initialize options with default values
    // The default value
    const parsedOptions = this.leaderboardService.parseOptions(
      defaultLeaderboardOptions
    );
    // This sets the initial value of options$ to the parsed options
    this.options$ = new BehaviorSubject(parsedOptions);

    // This is an observable of the first option in the options array
    const firstOption$ = this.options$.pipe(
      map((options) => options[0]),
      shareReplay(1)
    );

    // This observable merges the first option from the options$ input property with the selectOptionEvent$ subject
    // It ensures that the selected option is always the first one if no selection has been made
    // or updates to the latest selection when an option is clicked
    this.selectedOption$ = merge(firstOption$, this.selectOptionEvent$).pipe(
      shareReplay(1)
    );

    this.data$ = combineLatest([
      this.resource$,
      this.options$,
      this.selectedOption$,
    ]);
  }

  selectLeaderboard(option: LeaderboardParsedOption): void {
    // this.selectedOption$.next(option);
    this.selectOptionEvent$.next(option);
  }
  @Input("resource") set resource(value: Resource | string) {
    this.resourceService.loadResource(value).subscribe(this.resource$);
  }

  @Input("options") set options(value: LeaderboardOptions) {
    const parsedOptions = this.leaderboardService.parseOptions(value);
    this.options$.next(parsedOptions);
  }
}
