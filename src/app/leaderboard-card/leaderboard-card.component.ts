import {Component, Input, OnInit} from '@angular/core';
import {InternalService} from '../services/internal.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-leaderboard-card',
  templateUrl: './leaderboard-card.component.html',
  styleUrls: ['./leaderboard-card.component.scss']
})
export class LeaderboardCardComponent implements OnInit {
  @Input() database;
  loading_finished = false;
  curatorsData;
  displayedColumns = new BehaviorSubject<object>(['rank', 'name', 'generation_count', 'revision_count', 'invalidation_count', 'score']);


  constructor(private internalService: InternalService) { }

  ngOnInit(): void {
    this.loading_finished = false;

    this.internalService.GetLeaderboard(this.database['resource_uri'].substr(42)).subscribe(data => {
      this.curatorsData = data[0]['curators'].slice(0,10);
    }, (err) => {
    }, () => {
      this.loading_finished = true;

    });
  }

  calc_html_count_category (data, category) {
    const filtered_data = data.filter(x => x.activity_category === category);

    if (filtered_data.length > 0)  {
      return filtered_data[0]['count_category'].toString();
    } else {
      return '0';
    }
  }

}
