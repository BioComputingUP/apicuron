import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ELEMENT_TOKEN, TableConfig } from '../element-token';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `{{ element }}`
})
export class TableCellComponent {
  constructor(@Inject(ELEMENT_TOKEN) public element: TableConfig) {}
}