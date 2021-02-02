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
  @Input() selectedBadgesMedals: BehaviorSubject<object[]>;

  loading_finished = false;
  curatorsData;
  displayedColumns = new BehaviorSubject<object>(['rank', 'family_name', 'given_name', 'orcid', 'generation_count', 'revision_count', 'invalidation_count', 'score']);
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

    combineLatest(this.searchForm.valueChanges, this.selectedBadgesMedals).subscribe(([formData, selectedBadgesMedals]) => {
      const search_params = {};
      search_params[formData.area] = formData.key;
      search_params['achievements'] = selectedBadgesMedals.map(x => x['name']);



    this.internalService.GetLeaderboard(this.database['resource_uri'].substr(42), search_params).subscribe(data => {
      this.curatorsData = data[0]['biocurators'];
    }, (err) => {
    }, () => {
      this.loading_finished = true;

    });
    });
  this.searchForm.get('key').setValue('');

  }


  calc_html_tooltip_count_category(data, category) {

    if (data > 0) {
      return data + ' ' + category + ' activity';
    } else {
      return 'No ' + category + ' activity';
    }
  }

  removeBadgeMedal(position) {
    const listBadgesMedals = this.selectedBadgesMedals.value;
    listBadgesMedals.splice(position, 1);
    this.selectedBadgesMedals.next(listBadgesMedals);

  }


}
