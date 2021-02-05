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
