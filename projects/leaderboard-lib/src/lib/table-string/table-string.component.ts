import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: '.string-cell',
  template: `{{ cell }} {{ row | json }}`,
})

export class TableStringComponent {
  @Input() cell: string;
  @Input() row: any;
}