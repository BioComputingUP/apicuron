import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Medal } from "src/app/models/medal.model";
import { MedalDef } from "../../models/medal-def.model";
import { NgxPopperModule } from "ngx-popper";
import { BehaviorSubject, Observable } from "rxjs";
import { Term } from "../../models/term.model";
import { map } from "rxjs/operators";
// import 

@Component({
    standalone: true,
    selector: 'medal-def-card',
    imports: [CommonModule, NgxPopperModule],
    templateUrl: './medal-def-card.component.html',
    styleUrls: []
})
export class MedalDefCardComponent implements OnInit {

    readonly terms$: BehaviorSubject<Term[]> = new BehaviorSubject<Term[]>([]);
    termNames$: Observable<string[]>;

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