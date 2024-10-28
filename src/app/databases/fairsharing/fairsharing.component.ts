import { Component, EventEmitter, Output } from "@angular/core";
import { FairSharingService } from "../services/fairsharing.service";
import { Observable, Subject } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  selector: "fairsharing",
  templateUrl: "./fairsharing.component.html",
  imports: [CommonModule, FormsModule]
})
export class FairSharingComponent {
  @Output() myData = new EventEmitter<any>();
  doi: string = "";
  resource_data$: Observable<any>;
  destroy$ = new Subject<Boolean>();

  constructor(protected fairsharingService: FairSharingService) {};

  onDOIInputChange(): void {
    const extractedDOI = this.doi.split("/")[1];
    if (extractedDOI) {
      this.resource_data$ = this.fairsharingService.get_doi(extractedDOI);
    }
  };

  btnClick() {
    this.myData.emit(this.resource_data$);
  }
}