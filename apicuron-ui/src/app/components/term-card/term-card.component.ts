import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Term } from '../../models/term.model';
import * as _ from 'lodash';

@Component({
  selector: 'term-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './term-card.component.html',
  styleUrls: ['./term-card.component.scss']
})
export class TermCardComponent implements OnInit {

  constructor() { }

  @Input()
  term: Term;

  @Input()
  compact: boolean = false;

  categoryColor(){
    const converter = {
      'tw-text-green-100 tw-bg-generation': 'generation',
      'tw-text-orange-100 tw-bg-revision': 'revision',
      'tw-text-red-100 tw-bg-invalidation': 'invalidation',
    }

    return _.mapValues(converter, (category) => category == this.term.category)
  }

  scoreColor(){
    return 'tw-bg-gray-200 tw-text-gray-600'
  }

  ngOnInit(): void {
  }

}
