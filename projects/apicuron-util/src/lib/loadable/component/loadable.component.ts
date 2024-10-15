import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Observable, Subject } from "rxjs";
import { createLoadingState } from "../loading-state";
import { LoadingState } from "../interfaces";
import { tap } from "rxjs/operators";

@Component({
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  selector: "[loadable]",
  template: `
    <ng-container *ngIf="loadingData$ | async as loadingState">
      <ng-template #loading>
        <div
          class="tw-rounded tw-p-2 tw-flex tw-items-center tw-h-full tw-justify-center"
        >
          <svg-icon
            svgClass="tw-w-16 tw-h-16 md:tw-w-24 md:tw-h-24 tw-text-apicuron-purple tw-animate-spin"
            src="assets/svg/loading-spinner.svg"
          ></svg-icon>
        </div>
      </ng-template>
      <ng-content *ngIf="!loadingState.loading; else loading"></ng-content>
    </ng-container>
  `,
  styleUrls: [],
})
export class LoadableComponent implements OnInit {
  @Input("loadable") data: Observable<any>;

  loadingData$: Observable<LoadingState<any>>;
  ngOnInit(): void {
    this.loadingData$ = this.data.pipe(createLoadingState());
  }
}
