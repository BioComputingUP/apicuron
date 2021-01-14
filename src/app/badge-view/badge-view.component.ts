import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-badge-view',
  templateUrl: './badge-view.component.html',
  styleUrls: ['./badge-view.component.scss']
})
export class BadgeViewComponent implements OnInit {
  @Input() active;
  @Input() badge;

  constructor() { }

  ngOnInit(): void {
  }

}
