import {Component, Input, OnInit} from '@angular/core';
import {InternalService} from '../services/internal.service';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {FormControl, FormGroup, FormBuilder, FormArray} from '@angular/forms';

@Component({
  selector: 'app-leaderboard-card',
  templateUrl: './leaderboard-card.component.html',
  styleUrls: ['./leaderboard-card.component.scss']
})
export class LeaderboardCardComponent implements OnInit {
  @Input() database;
  loading_finished = false;
  curatorsData;
  displayedColumns = new BehaviorSubject<object>(['rank', 'name', 'orcid', 'generation_count', 'revision_count', 'invalidation_count', 'score']);
  searchForm: FormGroup;


  constructor(private internalService: InternalService, private fb: FormBuilder) {
  }


  ngOnInit(): void {
    this.loading_finished = false;
    this.searchForm = this.fb.group(
      {
        area: this.fb.control('curator_name'),
        key: this.fb.control(null)
      });

    combineLatest(this.searchForm.valueChanges).subscribe(([formData]) => {
      const search_params = {};
      search_params[formData.area] = formData.key;


    this.internalService.GetLeaderboard(this.database['resource_uri'].substr(42), search_params).subscribe(data => {
      this.curatorsData = data[0]['curators'];
    }, (err) => {
    }, () => {
      this.loading_finished = true;

    });
    });
  this.searchForm.get('key').setValue('');

  }

  calc_score_category(data, category) {
    const filtered_data = data.filter(x => x.activity_category === category);

    if (filtered_data.length > 0) {
      return filtered_data[0]['score_category'];
    } else {
      return 0;
    }
  }
  calc_html_tooltip_count_category(data, category) {
    const filtered_data = data.filter(x => x.activity_category === category);

    if (filtered_data.length > 0) {
      return filtered_data[0]['count_category'].toString() + ' ' + category + ' activity';
    } else {
      return 'No ' + category + ' activity';
    }
  }

}
