import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'badge-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.scss']
})
export class BadgeListComponent implements OnInit {

  @Input()
  initial_display_count: number = 6;

  @Input()
  item_per_row: number = 3;

  @Input()
  collapsed: Boolean = false;
  
  @Input()
  items: any[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
