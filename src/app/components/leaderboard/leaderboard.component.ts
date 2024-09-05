import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
import { Resource } from "../../models/resource.model";
import { RouterModule } from "@angular/router";
import { TotalLeaderboardComponent } from "../total-leaderboard/total-leaderboard.component";
import { WeeklyLeaderboardComponent } from "../weekly-leaderboard/weekly-leaderboard.component";
@Component({
  standalone: true,
  selector: "leaderboard",
  imports: [
    CommonModule,
    RouterModule,
    TotalLeaderboardComponent,
    WeeklyLeaderboardComponent,
  ],
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
  resource$: ReplaySubject<Resource> = new ReplaySubject<Resource>(1);
  @Input("resource") set resource(value: Resource) {
    this.resource$.next(value);
  }

  leaderboardType$ = new BehaviorSubject<"total" | "weekly">("total");

  constructor() {
    // preloading the loading svg icon
  }

  ngOnInit(): void {}

  selectLeaderboard(val: "total" | "weekly"): void {
    this.leaderboardType$.next(val);
  }

  isLeaderboard(val: "total" | "weekly"): Observable<boolean> {
    return this.leaderboardType$
      .asObservable()
      .pipe(map((type: "total" | "weekly") => type === val));
  }
}
