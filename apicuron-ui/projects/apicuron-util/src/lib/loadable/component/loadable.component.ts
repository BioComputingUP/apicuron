import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { filter, map, Observable } from "rxjs";
import { ImageSrcOverrideDirective } from "../../util";
import { LoadingState } from "../interfaces";
import { createLoadingState } from "../loading-state";

@Component({
  standalone: true,
  imports: [CommonModule, ImageSrcOverrideDirective, AngularSvgIconModule],
  selector: "[loadable]",
  template: `
    <ng-container *ngIf="loadingData$ | async as loadingState">
      <ng-template #loading>
        <div
          class="tw-rounded tw-p-2 tw-flex tw-items-center tw-h-full tw-justify-center"
        >
          <!-- <svg-icon
            svgClass="tw-w-16 tw-h-16 md:tw-w-24 md:tw-h-24 tw-text-apicuron-purple tw-animate-spin"
            src="assets/svg/loading-spinner.svg"
          ></svg-icon> -->
          <img
            src="assets/svg/loading-spinner.svg"
            class="tw-w-16 tw-h-16 md:tw-w-24 md:tw-h-24 tw-text-apicuron-purple tw-animate-spin"
            alt="loading spinner"
          />
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
  @Output("loadedContent") loadedContent: Observable<any>;

  ngOnInit(): void {
    this.loadingData$ = this.data.pipe(createLoadingState());
    this.loadingData$.pipe(
      filter((state) => state.loading === false && state.error === undefined),
      map((state) => state.data)
    );
  }
}
