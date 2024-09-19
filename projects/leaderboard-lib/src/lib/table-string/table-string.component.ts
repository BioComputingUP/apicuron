import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'table-string',
  template: `{{ string }}`,
  imports: [CommonModule]
})
export class TableStringComponent {
  @Input() string: string;
}