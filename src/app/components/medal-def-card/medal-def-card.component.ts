import { Component, Input, OnInit, ViewChild, TemplateRef} from "@angular/core";
import { CommonModule } from '@angular/common';
import { Medal } from "src/app/models/medal.model";
import { MedalDef } from "../../models/medal-def.model";
import { BehaviorSubject, Observable } from "rxjs";
import { Term } from "../../models/term.model";
import { map } from "rxjs/operators";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    standalone: true,
    selector: 'medal-def-card',
    imports: [CommonModule,MatTooltipModule],
    templateUrl: './medal-def-card.component.html',
    styleUrls: []
})
export class MedalDefCardComponent implements OnInit {
    readonly terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);
    termNames$: Observable<string[]>;
    showActivities: boolean = false;

    @ViewChild('activitiesList', { static: true }) activitiesList: TemplateRef<any>;

    ngOnInit(): void {
        this.termNames$ = this.terms$.asObservable().pipe(
            map((terms: Term[]) => {
                return terms.filter((term: Term) => this.medal.list_terms.includes(term.activity_term))
            }),
            map((terms: Term[]) => {
                return terms.map((term: Term) => term.activity_name)
            })
        )    }

    @Input()
    medal: MedalDef


    @Input()
    enableShadow = true;



    @Input()
    get terms() {
        return this.terms$.value;
    }
    set terms(value: Term[]) {
        this.terms$.next(value);
    }

}