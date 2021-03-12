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
  color_class = '';
  style_info = {};

  constructor() { }

  ngOnInit(): void {
    if (this.medal?.color[0] === '#') {
      this.style_info = {background: this.medal.color};
    } else if (this.medal?.color?.length > 0){
      this.color_class = this.medal.color;
    }
  }

}
