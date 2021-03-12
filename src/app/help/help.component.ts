import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {InternalService} from '../services/internal.service';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  wsname = environment.ws;
  curator_orcid = '0000-0002-0341-4888';
  resource_uri = 'https://registry.identifiers.org/registry/disprot';
  output = {};

  submit = {
    activity:
      {
        'resource_uri': 'https://registry.identifiers.org/registry/disprot',
        'reports': [
          {
            'activity_term': 'region_first_generation',
            'resource_uri': 'https://registry.identifiers.org/registry/disprot',
            'timestamp': '2016-08-11T09:59:17.000Z',
            'curator_orcid': '0000-0002-0341-4888',
            'entity_uri': 'https://identifiers.org/disprot:DP00034'
          }
        ]
      },

    description: {
      'resource_name': 'DisProt',
      'resource_uri': 'https://registry.identifiers.org/registry/disprot',
      'resource_url': 'https://disprot.org/',
      'resource_long_name': 'The database of intrinsically disordered proteins',
      'resource_description': 'DisProt is a database of intrinsically disordered proteins...',
      'terms_def': [{'activity_term': 'region_reference_first_genearation', 'activity_name': 'Novel publication', 'activity_category': 'generation', 'score': 50, 'description': 'Added publication not available before in the database'}],
      'achievements_def': [{'category': '1', 'name': 'Newbie curator', 'count_threshold': 10, 'type': 'badge', 'list_terms': ['region_reference_first_genearation'], 'color_code': '#055701'}, {'category': '6', 'score_relative': 1, 'name': 'Best biocurator 2020', 'color': 'gold', 'first_day': '2020-01-01T00:00:00.000000', 'last_day': '2020-12-31T23:59:59.000000', 'type': 'medal', 'list_terms': ['region_reference_first_genearation']}],
    }
  };

  constructor(private internalService: InternalService) { }

  ngOnInit() {

    this.internalService.getReports(new HttpParams()
      .set('curator_orcid', this.curator_orcid)
      .set('limit', '1'))
      .subscribe(data => {
        console.log(data);
        this.output['reports'] = data.slice(0, 1);  // TODO remove slice once limit get implemented
    });

    this.internalService.getAchievements(new HttpParams()
      .set('curator_orcid', this.curator_orcid)
      .set('limit', '1'))
      .subscribe(data => {
        console.log(data);
        this.output['achievements'] = data.slice(0, 1);  // TODO remove slice once limit get implemented
      });

    this.internalService.getLeaderboards(new HttpParams()
      .set('resource_uri', this.resource_uri)
      .set('sort', 'score')
      .set('limit', '1'))
      .subscribe(data => {
        console.log(data);
        this.output['leaderboards'] = data.slice(0, 1);  // TODO remove slice once limit get implemented
      });

  }

scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}
