import { Component, Input, OnInit, ViewChild, TemplateRef, ElementRef, ViewContainerRef } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Medal } from "src/app/models/medal.model";
import { MedalDef } from "../../models/medal-def.model";
import { BehaviorSubject, Observable } from "rxjs";
import { Term } from "../../models/term.model";
import { map } from "rxjs/operators";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
    standalone: true,
    selector: 'medal-def-card',
    imports: [CommonModule],
    templateUrl: './medal-def-card.component.html',
    styleUrls: []
})
export class MedalDefCardComponent implements OnInit {
    readonly terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);
    termNames$: Observable<string[]>;
    showActivities: boolean = false;

    @ViewChild('activitiesList', { static: true }) activitiesList: TemplateRef<any>;
    overlayRef!: OverlayRef; // Reference to the active overlay

    constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

    ngOnInit(): void {
        this.termNames$ = this.terms$.asObservable().pipe(
            map((terms: Term[]) => {
                return terms.filter((term: Term) => this.medal.list_terms.includes(term.activity_term));
            }),
            map((terms: Term[]) => {
                return terms.map((term: Term) => term.activity_name);
            })
        );
    }

    @Input()
    medal: MedalDef;

    @Input()
    enableShadow = true;

    @Input()
    get terms() {
        return this.terms$.value;
    }
    set terms(value: Term[]) {
        this.terms$.next(value);
    }

    openTooltip(target: EventTarget | null) {
        if (!target) return; // Check if target is null
        const element = target as HTMLElement; // Type assertion
        if (!element) return; // Ensure target is an HTMLElement

        if (this.overlayRef) {
            return; // Prevent multiple overlays from opening
        }

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(element)
            .withPositions([
                { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' }
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: false
        });

        const portal = new TemplatePortal(this.activitiesList, this.viewContainerRef);
        this.overlayRef.attach(portal);
    }

    closeTooltip() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null!;
        }
    }
}

