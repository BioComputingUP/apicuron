import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeDef } from '../../models/badge-def.model';
import { Term } from '../../models/term.model';

@Component({
  selector: 'badge-def-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-def-card.component.html',
  styleUrls: ['./badge-def-card.component.scss']
})
export class BadgeDefCardComponent implements OnInit {

  constructor() { }

  @Input()
  badgeDef: BadgeDef;

  @Input()
  terms: Term[]

  ngOnInit(): void {
  }

}
