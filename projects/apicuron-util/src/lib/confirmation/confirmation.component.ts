import { Component, EventEmitter, Inject, OnDestroy } from "@angular/core";
import {
  Confirmation,
  ConfirmationResponse,
  ConfirmationStyleOptions,
} from "./interfaces/confirmation";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: "confirmation",
  templateUrl: "./confirmation.component.html",
  styleUrls: [],
})
export class ConfirmationComponent implements OnDestroy {
  confirmationText: string;
  cancelText: string;
  style: ConfirmationStyleOptions;
  iconSrc: string;
  constructor(
    @Inject(DIALOG_DATA) protected data: Confirmation,
    protected dialog: DialogRef
  ) {
    this.message = data.message;
    this.title = data.title;
    this.confirmationText = data.confirmationText;
    this.cancelText = data.cancelText;
    this.iconSrc = data.iconSrc;
    this.style = data.style;
  }

  message: string;
  title: string;
  destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroy$.next();
  }

  callbackProcessing$ = new BehaviorSubject<boolean>(false);

  async accept() {
    this.callbackProcessing$.next(true);

    try {
      const result = this.data.accept();
      if (result instanceof Promise) {
        await result;
      }
    } catch (e) {
      console.error(`The confirmation accept callback threw an error: ${e}`);
    }
    this.callbackProcessing$.next(false);
    this.dialog.close(ConfirmationResponse.accepted);
  }

  async cancel() {
    this.callbackProcessing$.next(true);
    try {
      const result = this.data.reject();
      if (result instanceof Promise) {
        await result;
      }
    } catch (e) {
      console.error(`The confirmation reject callback threw an error: ${e}`);
    }
    this.callbackProcessing$.next(false);

    this.dialog.close(ConfirmationResponse.rejected);
  }
}
