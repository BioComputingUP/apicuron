import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
} from "@angular/core";
import { Overlay, OverlayRef, PositionStrategy } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { ViewContainerRef } from "@angular/core";
import { Term } from "src/app/models/term.model";
import { Report } from "src/app/models/report.model";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  selector: "report-card",
  templateUrl: "./report-card.component.html",
})
export class ReportCardComponent implements AfterViewInit {
  @Input() report: Report;
  @Input() term: Term;
  @Input() truncate_description = true;

  @ViewChild("tooltipTemplate", { static: true }) tooltipTemplate;
  overlayRef: OverlayRef;
  tooltipVisible = false;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {}

  // Define the category color mapping
  categoryColor() {
    const converter: Record<string, string> = {
      generation: "tw-bg-generation tw-text-white",
      revision: "tw-bg-revision tw-text-white",
      invalidation: "tw-bg-invalidation tw-text-white",
    };
    return converter[this.term.category] || "";
  }

  // Open Tooltip - Create Overlay
  openTooltip(event: MouseEvent) {
    if (this.overlayRef) {
      return; // If tooltip already open, don't open a new one
    }

    const positionStrategy: PositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(event.target as HTMLElement)
      .withPositions([
        {
          originX: "center",
          originY: "bottom",
          overlayX: "center",
          overlayY: "top",
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const tooltipPortal = new TemplatePortal(
      this.tooltipTemplate,
      this.viewContainerRef,
    );
    this.overlayRef.attach(tooltipPortal);
    this.tooltipVisible = true;
  }

  // Close Tooltip - Dispose Overlay
  closeTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null!;
    }
    this.tooltipVisible = false;
  }

  ngAfterViewInit() {}

  get entity_name() {
    const url = new URL(this.report.entity_uri);

    let host = url.hostname.replace(/^www\./, "");
    if (host.length > 25) {
      // Takes just the first part of a long subdomain (e.g., 'training-collection-dev...')
      host = host.split(".")[0] + "...";
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments.length > 0 ? segments[segments.length - 1] : "";
    if (url.search) {
      const first_param = url.searchParams.entries().next().value;
      if (first_param) {
        const [key, value] = first_param;
        return `.../${value}`;
      }
    }
    // Result: training-collection-dev.../.../528
    return `.../${id}`;
  }
}
