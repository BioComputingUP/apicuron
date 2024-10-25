import { Component, OnDestroy } from "@angular/core";
import { FairSharingService } from "../services/fairsharing.service";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  selector: "fairsharing",
  templateUrl: "./fairsharing.component.html",
  imports: [CommonModule, FormsModule]
})
export class FairSharingComponent implements OnDestroy {
  doi: string = "";
  resource_data$: Observable<any>;

  constructor(protected fairsharingService: FairSharingService) { };

  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

  onDOIInputChange(): void {
    const extractedDOI = this.doi.split('/')[1];
    if (extractedDOI) {
      this.resource_data$ = this.fairsharingService.get_doi(extractedDOI);
    }
  }
}