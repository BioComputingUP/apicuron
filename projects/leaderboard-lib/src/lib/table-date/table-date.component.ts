import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ELEMENT_TOKEN } from '../element-token';
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: '[medals-cell]',
  template: `<div>{{ element?.medals_count }}</div>`
})
export class TableDateComponent {
  constructor(@Inject(ELEMENT_TOKEN) public element: any) {}
}