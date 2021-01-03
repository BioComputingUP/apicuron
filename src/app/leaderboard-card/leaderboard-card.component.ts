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
  displayedColumns = new BehaviorSubject<object>(['score','name',  'generation_count', 'revision_count', 'invalidation_count']);


  constructor(private internalService: InternalService) { }

  ngOnInit(): void {
    this.loading_finished = false;

    this.internalService.GetLeaderboard(this.database['resource_uri'].substr(42)).subscribe(data => {
      this.curatorsData = data;
    }, (err) => {
    }, () => {
      this.loading_finished = true;

    });
  }

}
