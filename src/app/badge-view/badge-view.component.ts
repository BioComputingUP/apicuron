import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-badge-view',
  templateUrl: './badge-view.component.html',
  styleUrls: ['./badge-view.component.scss']
})
export class BadgeViewComponent implements OnInit {
  @Input() active;
  @Input() badge;

  alpha_map = {
    1: 'a0',
    10: 'b0',
    50: 'c0',
    100: 'd0',
    500: 'e0',
    1000: 'f0',
    5000: 'ff',
  };

  constructor() { }

  ngOnInit(): void {
  }

}
