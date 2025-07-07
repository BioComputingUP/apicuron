import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BipScholarSection } from "src/app/models/external/bip-scholar.model";
import { BipScoresTooltipManager } from "../bip-scores.component";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "bip-scholar-card",
  templateUrl: "./bip-scholar-card.component.html",
  styleUrl: "./bip-scholar-card.component.scss",
})
export class BipScholarCardComponent implements OnInit, OnDestroy {
  @Input() stats_section_info: BipScholarSection;

  activeTooltipId: string | null = null;
  private subscription: any;

  constructor(private tooltipService: BipScoresTooltipManager) {}

  ngOnInit(): void {
    this.subscription = this.tooltipService.activeTooltip$.subscribe(
      (activeId) => {
        this.activeTooltipId = activeId;
      }
    );
  }

  toggleDescription(index: number, event: Event): void {
    event.stopPropagation();
    const tooltipId = `${this.stats_section_info.title}-${index}`;
    this.tooltipService.setActiveTooltip(tooltipId);
  }
  closeTooltip(event: Event): void {
    if (event.target === event.currentTarget) {
      this.tooltipService.clearTooltip();
    }
  }
  isTooltipActive(index: number): boolean {
    const tooltipId = `${this.stats_section_info.title}-${index}`;
    return this.activeTooltipId === tooltipId;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
