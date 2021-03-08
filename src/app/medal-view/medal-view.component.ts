import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-medal-view',
  templateUrl: './medal-view.component.html',
  styleUrls: ['./medal-view.component.scss']
})
export class MedalViewComponent implements OnInit {
  @Input() medal;
  @Input() atLeaderboard = false;
  @Input() databaseName = '';

  constructor() { }

  ngOnInit(): void {
    console.log(this.medal);
  }

}
