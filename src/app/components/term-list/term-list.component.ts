import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Term } from '../../models/term.model';
import { TermCardComponent } from '../term-card/term-card.component';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Component({
  selector: 'term-list',
  standalone: true,
  imports: [CommonModule, TermCardComponent],
  templateUrl: './term-list.component.html',
  styleUrls: ['./term-list.component.scss']
})
export class TermListComponent implements OnInit, OnChanges, AfterViewInit {
  initialTerms$: Observable<Term[]>;
  remainingTerms$: Observable<Term[]>;

  @ViewChild('collapse_container') collapse_container: ElementRef;
  @Input()
  terms: Term[];

  @Input()
  initial_display_count: number = 6;

  @Input()
  item_per_row: number = 3;

  @Input()
  collapsed: Boolean = false;

  collapsed$ = new BehaviorSubject<Boolean>(false);
  termsContainerClass$ = new BehaviorSubject<string>('tw-w-1/3')
  initialDisplayCount$ = new BehaviorSubject<number>(6);
  constructor() {

  }
  ngAfterViewInit(): void {
  }

  // handle changes to the input properties
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.collapsed) {
      this.collapsed$.next(changes.collapsed.currentValue)
    }
    if(changes.item_per_row){
      this.termsContainerClass$.next('tw-w-1/' + changes.item_per_row.currentValue)
    }
    if(changes.initial_display_count){
      this.initialDisplayCount$.next(changes.initial_display_count.currentValue)
    }
  }



  ngOnInit(): void {

    this.initialTerms$ = combineLatest([of(this.terms), this.initialDisplayCount$]).pipe(
      map(([terms, displayCount]:[Term[], number]): Term[] => {
        return terms.slice(0, displayCount);
      }),
      map(this.computeTermsQuantile)
    )

    this.remainingTerms$ = combineLatest([of(this.terms), this.initialDisplayCount$]).pipe(
      map(([terms, displayCount]:[Term[], number]): Term[] => {
        return terms.slice(displayCount);
      }),
      map(this.computeTermsQuantile)
    )
  }


  term_card_container_class() {
    return 'tw-w-1/' + this.item_per_row
  }

  computeTermsQuantile(terms: Term[]) {
    terms.sort((a, b) => a.score - a.score)
    let q1 = terms.length / 4;
    let q3 = terms.length * 3 / 4

    return terms.map((term, index) => {
      if (index < q1) {
        term.quartile = 1
        return term
      }
      if (index > q3) {
        term.quartile = 3
        return term
      }
      term.quartile = 2
      return term
    })
  }


}
