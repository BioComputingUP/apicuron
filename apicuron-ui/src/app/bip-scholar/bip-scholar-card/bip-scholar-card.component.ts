import { Component, Input } from "@angular/core";
import { BipScholarSection } from "src/app/models/external/bip-scholar.model";

/** One group of BIP! Scholar indicators; each indicator's description shows on hover. */
@Component({
  selector: "bip-scholar-card",
  templateUrl: "./bip-scholar-card.component.html",
})
export class BipScholarCardComponent {
  @Input() stats_section_info: BipScholarSection;

  /** keeps the indicators in the order BIP! Scholar sections define them */
  keepOrder = () => 0;
}
