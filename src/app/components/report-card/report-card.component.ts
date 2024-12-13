import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { Term } from 'src/app/models/term.model';
import { Report } from 'src/app/models/report.model';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  selector: 'report-card',
  templateUrl: './report-card.component.html',
})
export class ReportCardComponent implements AfterViewInit {
  @Input() report: Report;
  @Input() term: Term;
  @Input() truncate_description = true;

  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate;
  overlayRef: OverlayRef;
  tooltipVisible = false;

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

  // Define the category color mapping
  categoryColor() {
    const converter = {
      'tw-text-green-100 tw-bg-generation': 'generation',
      'tw-text-orange-100 tw-bg-revision': 'revision',
      'tw-text-red-100 tw-bg-invalidation': 'invalidation',
    };
    return Object.keys(converter).find((key) => converter[key] === this.term.category) || '';
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
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const tooltipPortal = new TemplatePortal(this.tooltipTemplate, this.viewContainerRef);
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
}
