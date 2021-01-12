import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  styleUrls: ['./leaderboard-page.component.scss']
})
export class LeaderboardPageComponent implements OnInit {
  listResourcesDescriptions;

  constructor( private scrollToService: ScrollToService,
               private route: ActivatedRoute,
               private internalService: InternalService) { }

  ngOnInit(): void {
    this.internalService.GetResearces().subscribe(data => {
      this.listResourcesDescriptions = data;
    }, (err) => {
    }, () => {
      if (this.route.snapshot.queryParams.hasOwnProperty('resource'))  {
        // console.log('this.route.snapshot.queryParams.hasOwnProperty(\'resource\')');
        // console.log('document.getElementById("ped")', document.getElementById("ped"));

        const config: ScrollToConfigOptions = {
          // target: 'ped',
          offset: -230,
          duration: 0,
          target: this.route.snapshot.queryParams.resource
        };
          // setTimeout(function () {
          //   this.scrollToService.scrollTo(config);
          //
          // }, 5000);
        // this.scrollToService.scrollTo(config);
        this.scrolTo(this.scrollToService, config);
      }

    });


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
    }, 1000);
  }
}
