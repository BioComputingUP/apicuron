import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  wsname = environment.ws;
  orcid_id = '0000-0002-0341-4888';
  output = {};

  constructor(private internalService: InternalService) { }

  ngOnInit() {

    this.internalService.GetORCIDprofile(this.orcid_id).subscribe(data => {
      console.log(data);
      this.output['reports'] = data;
    });

    this.internalService.GetORCIDprofile(this.orcid_id).subscribe(data => {
      console.log(data);
      this.output['achievements'] = data;
    });

    this.internalService.GetORCIDprofile(this.orcid_id).subscribe(data => {
      console.log(data);
      this.output['statistics'] = data;
    });

  }

scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}
