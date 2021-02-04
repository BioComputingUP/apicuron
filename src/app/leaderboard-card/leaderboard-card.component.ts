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
      search_params['resource'] = this.database['resource_uri'].substr(42);



    this.internalService.GetStatistics(search_params).subscribe(data => {
      this.curatorsData = data.map(currBiocurator =>  {
        const currData = currBiocurator.statistics.filter(currDataObj => {
          return currDataObj.hasOwnProperty('resource_uri') && currDataObj.resource_uri === this.database['resource_uri'];
        })[0];

        console.log(currData );
        return {
          curator_orcid: currBiocurator.curator_orcid,
          family_name: currBiocurator.family_name,
          given_name: currBiocurator.given_name,
          ranking: currData.ranking,
          score_total: currData.total_score,
          generation_count: currData.generation_count,
          revision_count: currData.revision_count,
          invalidation_count: currData.invalidation_count,
          generation_score: currData.generation_score,
          revision_score: currData.revision_score,
          invalidation_score: currData.invalidation_score,
        };
      });
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
