import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import {ActivatedRoute} from '@angular/router';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {
 resourcesDescription = false;
  constructor(private scrollToService: ScrollToService, private route: ActivatedRoute, private internalService: InternalService) { }

  selectedBadgesMedals = new BehaviorSubject<object[]>([]);
  badge_categories = [];
  medal_categories = [];
  badgesData = {};
  medalsData = {};

  ngOnInit(): void {

   console.log(this.route.snapshot.queryParams);
    const resource_uri = this.route.snapshot.queryParams.resource_uri;
    // const resource_id = window.location.pathname.substring(11);

    // console.log('this.route.snapshot', this.route.snapshot);
    console.log('this.route.snapshot.fragment', this.route.snapshot.fragment);
    // console.log('window.location', window.location);
    // console.log(resource_uri, resource_uri.length > 1 );
    if (resource_uri.length > 1) {
      this.internalService.GetResearces({
        resource_uri: resource_uri
      }).subscribe(data => {
        if (data.length === 1) {
          this.resourcesDescription = data[0];
          this.resourcesDescription['terms'].sort( (a, b) => {
             if ( a.activity_category === b.activity_category) {
               return  a.score > b.score ? -1 : 1;
             } else if ( a.activity_category === 'generation' || b.activity_category === 'generation') {
               return  a.activity_category === 'generation' ?  -1 : 1;
             } else {
               return  a.activity_category === 'revision' ?  -1 : 1;
             }
          });
          this.resourcesDescription['badges'].forEach(currBadge => {

            if (!this.badgesData.hasOwnProperty(currBadge['category'])) {
              this.badgesData[currBadge['category']] = [];
            }
            this.badgesData[currBadge['category']].push(currBadge);
          });
          this.badge_categories = Object.keys(this.badgesData);
          this.badge_categories.forEach(currCategory => {
            this.badgesData[currCategory] = this.badgesData[currCategory].sort((a, b) => a.count_threshold > b.count_threshold ? 1 : -1);
          });

          console.log(this.badgesData);
          this.resourcesDescription['medals'].forEach(currMedal => {
            if (!this.medalsData.hasOwnProperty(currMedal['color'])) {
              this.medalsData[currMedal['color']] = [];
            }
            this.medalsData[currMedal['color']].push(currMedal);
          });
          this.medal_categories = Object.keys(this.medalsData);
          this.medal_categories.forEach(currCategory => {
            this.medalsData[currCategory] = this.medalsData[currCategory].sort((a, b) => a.name > b.name ? 1 : -1);
          });
        }
      }, (err) => {
      }, () => {
        console.log('this.route.snapshot.fragment', this.route.snapshot.fragment);
        const config: ScrollToConfigOptions = {
          // target: 'ped',
          offset: -230,
          duration: 0.2,
          target: this.route.snapshot.fragment
        };
        // setTimeout(function () {
        //   this.scrollToService.scrollTo(config);
        //
        // }, 5000);
        // this.scrollToService.scrollTo(config);
        this.scrolTo(this.scrollToService, config);

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

  scrolTo(newState, config) {
    setTimeout(function () {
      newState.scrollTo(config);
    }, 800);
  }

  addBadgeMedalToSelectedList(currBadge) {
    this.selectedBadgesMedals.next([...this.selectedBadgesMedals.getValue(), ...[currBadge]]);
  }
}
