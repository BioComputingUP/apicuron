import { Overlay, OverlayRef, PositionStrategy } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, shareReplay } from "rxjs/operators";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidProfileLink } from "src/app/orcid/types/orcid";
import { User } from "../../models/User.model";

@Component({
  standalone: true,
  selector: "curator-profile",
  templateUrl: "./curator-profile.component.html",
  imports: [CommonModule, OrcidModule],
  styleUrls: ["./curator-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorProfileComponent implements OnInit {
  profileLinks$: Observable<OrcidProfileLink[]>;
  keywords$: Observable<string[]>;
  biography$: Observable<string>;
  employment$: Observable<string>;

  userInfo$: Observable<Boolean>;

  overlayRef: OverlayRef;
  @ViewChild("tooltipTemplate", { static: true }) tooltipTemplate;

  constructor(
    protected orcidService: OrcidService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  curator$ = new BehaviorSubject<User>(null);
  @Input() set curator(value: User) {
    this.curator$.next(value);
  }

  curatorObs$ = this.curator$.asObservable().pipe(
    filter((curator) => !!curator),
    shareReplay(1)
  );

  ngOnInit(): void {
    this.profileLinks$ = this.curatorObs$.pipe(
      map((curator: User) => {
        return curator.links;
      })
    );
  }

  openTooltip(event: MouseEvent, tooltipContent: string) {
    if (this.overlayRef) {
      return; // If tooltip is already open, don't create another
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
      {
        $implicit: tooltipContent,
      }
    );

    this.overlayRef.attach(tooltipPortal);
  }

  closeTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null!;
    }
  }
}
