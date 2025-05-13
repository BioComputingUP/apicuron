import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { BipScholarSection } from "src/app/models/external/bip-scholar.model";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "bip-scholar-card",
  templateUrl: "./bip-scholar-card.component.html",
})
export class BipScholarCardComponent {
  @Input() stats_section_info: BipScholarSection;
}
