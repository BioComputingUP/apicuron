import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: '.date-cell',
  template: `{{ cell | date: 'yyyy' }} {{ row | json}}`,
})
export class TableDateComponent {
  @Input() cell: Date;
  @Input() row: any;
}

