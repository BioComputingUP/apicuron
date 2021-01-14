import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {
 resourcesDescription = false;
  constructor(private internalService: InternalService) { }

  ngOnInit(): void {

    const resource_id = window.location.pathname.substring(11);
    console.log(resource_id, resource_id.length > 1 );
    if (resource_id.length > 1) {
      this.internalService.GetResearces({
        resource_id: resource_id
      }).subscribe(data => {
        if (data.length === 1) {
          this.resourcesDescription = data[0];
        }
      }, (err) => {
      }, () => {
      });
    }
// console.log(resource_id)
    window.addEventListener("scroll", event => {
      if (document.getElementById("second-nav-bar")) {
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
          document.getElementById("second-nav-bar").style['margin-top'] = '0px';
          document.getElementById("second-nav-bar").style['padding-top'] = '10px';
          // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';

        } else {
          document.getElementById("second-nav-bar").style['margin-top'] = '75px';
          document.getElementById("second-nav-bar").style['padding-top'] = '0px';
          // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
        }
      }
    });
  }


}
