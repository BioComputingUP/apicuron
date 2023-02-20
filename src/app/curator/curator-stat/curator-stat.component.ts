import { HttpParams } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, combineLatest, fromEvent, Observable } from "rxjs";
import {
  map,
  pluck,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import {
  Curator,
  CuratorPageService,
  CuratorStat,
} from "../curator-page/curator-page.service";
import * as moment from "moment";
import { DatabasesService } from "../../databases/services/databases.service";
@Component({
  selector: "curator-stat",
  templateUrl: "./curator-stat.component.html",
  styleUrls: ["./curator-stat.component.scss"],
})
export class CuratorStatComponent implements OnInit, AfterViewInit {
  max_page$: Observable<number>;

  constructor(protected curatorPageService: CuratorPageService, protected databaseService: DatabasesService) {}

  // Component Inputs
  @Input() curator$: Observable<Curator>;
  @Input() resource$: Observable<any>;
  @Input() user_stats$: Observable<any>;
  @Input() user_resources$: Observable<any[]>;

  // Achievements and stats
  achievements$: Observable<any>;
  current_stat$: Observable<CuratorStat>;

  // reports variables
  user_reports$: Observable<Object>;
  report_count$: Observable<Object>;

  // Simple display variables
  more_badges = false;
  more_medals = false;

  // Pagination variables
  current_report_page$ = new BehaviorSubject<number>(1);
  page_size = 8;
  @ViewChild("btnId", { static: false }) next_page: ElementRef;

  previous_page() {
    if (this.current_report_page$.value > 1) {
      this.current_report_page$.next(this.current_report_page$.value - 1);
    }
  }

  ngOnInit() {
    this.achievements$ = combineLatest([this.curator$, this.resource$]).pipe(
      switchMap(([curator, { resource_id }]) => {
        return this.curatorPageService.get_achievements(
          curator.orcid_id,
          resource_id
        );
      }),
      shareReplay()
    );

    const report_data$ = combineLatest([
      this.curator$,
      this.resource$,
      this.current_report_page$,
    ]).pipe(
      switchMap(([curator, { resource_id }, page]) => {
        const params = new HttpParams({
          fromObject: {
            page: page.toString(),
            page_size: this.page_size.toString(),
            resource_id,
            curator_orcid: curator.orcid_id
          },
        });
        return this.curatorPageService.get_reports(
          params
        );
      }),
      shareReplay()
    );
    this.user_reports$ = report_data$.pipe(
      pluck("data"),
      map((reports: Array<Object>) => {
        const formatted_reports = reports.map((report) => {
          const relativeDate = moment(report["timestamp"]).fromNow();
          return {
            ...report,
            activity_name: report["term"]["activity_name"],
            description: report["term"]["description"],
            activity_category: report["term"]["activity_category"],
            timestamp: relativeDate,

          };
        });

        return formatted_reports;
      })
    );

    this.report_count$ = report_data$.pipe(pluck("count"));

    this.max_page$ = this.report_count$.pipe(
      map((count: number) => {
        // we return the highest rounded number after the division
        return Math.ceil(count / this.page_size);
      })
    );

    this.current_stat$ = combineLatest([this.user_stats$, this.resource$]).pipe(
      map(([stats, { resource_id }]) => {
        return stats.find((stat) => stat.resource_id == resource_id);
      })
    );

    
  }

  ngAfterViewInit() {
    fromEvent(this.next_page.nativeElement, "click")
      .pipe(withLatestFrom(this.max_page$))
      .subscribe(([click, max_page]) => {
        if (this.current_report_page$.value < max_page) {
          this.current_report_page$.next(this.current_report_page$.value + 1);
        }
      });
  }
}
