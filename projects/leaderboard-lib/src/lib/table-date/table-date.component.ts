import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'table-date',
  template: `{{ date }}`,
  imports: [CommonModule]
})
export class TableDateComponent {
  @Input() date: number;
}