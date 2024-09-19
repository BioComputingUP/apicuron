import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'table-score',
  template: `{{ score }}`,
  imports: [CommonModule]
})
export class TableScoreComponent {
  @Input() score: number;
}