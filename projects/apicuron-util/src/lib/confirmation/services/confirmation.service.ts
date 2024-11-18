import { Injectable, OnDestroy } from "@angular/core";
import {
  Confirmation,
  ConfirmationOptions,
  ConfirmationResponse,
  DEFAULT_CONFIRMATION,
} from "../interfaces/confirmation";
import { Dialog, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { ConfirmationComponent } from "../confirmation.component";
import {
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  Observable,
  of,
  Subject,
} from "rxjs";
import { map, switchMap, takeUntil, tap } from "rxjs/operators";
import { ComponentType } from "@angular/cdk/portal";
import { LoadingState } from "../../loadable";

@Injectable()
export class ConfirmationService implements OnDestroy {
  //   confirmationSubject$ = new Subject<Confirmation>();

  //   dialogIsOpen$ = new BehaviorSubject<boolean>(false);

  destroy$ = new Subject<void>();

  constructor(protected dialogService: Dialog) {
    // this.confirmationSubject$
    //   .pipe(
    //     tap(() => {
    //       if (this.dialogIsOpen$.getValue()) {
    //         throw new Error("There is already a confirmation dialog open");
    //       }
    //     }),
    //     map((confirmation: Confirmation) => {
    //       const dialog = this.openDialog(ConfirmationComponent, {
    //         data: confirmation,
    //       });
    //       return { dialog, confirmation };
    //     }),
    //     switchMap(({ dialog, confirmation }) => {
    //       return combineLatest([
    //         of(dialog),
    //         dialog.componentInstance.confirmationResult,
    //         of(confirmation),
    //       ]);
    //     }),
    //     switchMap(async ([dialog, result, confirmation]) => {
    //       await this.runConfirmationCallback(confirmation, result);
    //       return dialog;
    //     }),
    //     map((dialog) => {
    //       return dialog.close();
    //     }),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private openDialog<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    try {
      const dialog = this.dialogService.open(component, config);
      //   this.dialogIsOpen$.next(true);
      //   dialog.closed.pipe(map(() => false)).subscribe(this.dialogIsOpen$);
      return dialog;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  dialog: DialogRef | null = null;

  public confirm(confirmationOptions: ConfirmationOptions) {
    const confirmation: Confirmation = {
      ...DEFAULT_CONFIRMATION,
      ...confirmationOptions,
    };

    this.dialog = this.dialogService.open(ConfirmationComponent, {
      data: confirmation,
    });

    this.dialog.closed.pipe(
      tap(() => {
        this.dialog = null;
      }),
      takeUntil(this.destroy$)
    );

    return;
  }
}
