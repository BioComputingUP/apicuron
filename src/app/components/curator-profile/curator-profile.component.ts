import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewContainerRef,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { User } from "../../models/User.model";
import { OrcidService } from "src/app/orcid/services/orcid.service";
import { OrcidModule } from "src/app/orcid/orcid.module";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { OrcidProfileLink } from "src/app/orcid/types/orcid";
import { filter, map, shareReplay, switchMap } from "rxjs/operators";
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  standalone: true,
  selector: "curator-profile",
  templateUrl: "./curator-profile.component.html",
  imports: [CommonModule, OrcidModule],
  styleUrls: ["./curator-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuratorProfileComponent implements OnInit, AfterViewInit {
  profileLinks$: Observable<OrcidProfileLink[]>;
  keywords$: Observable<string[]>;
  biography$: Observable<string>;
  employment$: Observable<string>; // field for the place of work

  userInfo$: Observable<Boolean>;

  overlayRef: OverlayRef;
  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate;

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
    this.biography$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_biography(curator.orcid_id)
      )
    );
    
    this.keywords$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_keywords(curator.orcid_id)
      )
    );
    this.profileLinks$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_profile_links(curator.orcid_id)
      )
    );
    this.employment$ = this.curatorObs$.pipe(
      switchMap((curator: User) =>
        this.orcidService.get_employment(curator.orcid_id)
      )
    );
   
    this.userInfo$ = merge(
      this.biography$,
      this.keywords$,
      this.profileLinks$,
      this.employment$,
    ).pipe(map((k) => true));
  }

  ngAfterViewInit(): void {}

  openTooltip(event: MouseEvent, tooltipContent: string) {
    if (this.overlayRef) {
      return; // If tooltip is already open, don't create another
    }

    const positionStrategy: PositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(event.target as HTMLElement)
      .withPositions([
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const tooltipPortal = new TemplatePortal(this.tooltipTemplate, this.viewContainerRef, {
      $implicit: tooltipContent
    });

    this.overlayRef.attach(tooltipPortal);
  }

  closeTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null!;
    }
  }
}
