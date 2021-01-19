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

  badge_categories = [];
  medal_categories = [];
  badgesData = {};
  medalsData = {};

  ngOnInit(): void {

    const resource_id = window.location.pathname.substring(11);
    console.log(resource_id, resource_id.length > 1 );
    if (resource_id.length > 1) {
      this.internalService.GetResearces({
        resource_id: resource_id
      }).subscribe(data => {
        if (data.length === 1) {
          this.resourcesDescription = data[0];
          this.resourcesDescription['badges'].forEach(currBadge => {

            if (!this.badgesData.hasOwnProperty(currBadge['category'])) {
              this.badgesData[currBadge['category']] = [];
            }
            this.badgesData[currBadge['category']].push(currBadge);
          });
          this.badge_categories = Object.keys(this.badgesData);
          this.badge_categories.forEach(currCategory => {
            this.badgesData[currCategory] = this.badgesData[currCategory].sort((a, b) => a.count_threshold > b.count_threshold);
          });

          console.log(this.badgesData);
          this.resourcesDescription['medals'].forEach(currMedal => {
            if (!this.medalsData.hasOwnProperty(currMedal['category'])) {
              this.medalsData[currMedal['category']] = [];
            }
            this.medalsData[currMedal['category']].push(currMedal);
          });
          this.medal_categories = Object.keys(this.medalsData);
          this.medal_categories.forEach(currCategory => {
            this.medalsData[currCategory] = this.medalsData[currCategory].sort((a, b) => a.score_relative > b.score_relative);
          });
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
