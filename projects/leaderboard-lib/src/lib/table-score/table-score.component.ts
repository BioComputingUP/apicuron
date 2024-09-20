import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: '.score-cell',
  template: `{{ cell | number }} {{ row | json}}`,
})
export class TableScoreComponent {
  @Input() cell: number;
  @Input() row: any;
}