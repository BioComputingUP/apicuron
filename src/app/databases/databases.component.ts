import {Component, OnInit} from '@angular/core';
import {InternalService} from '../services/internal.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';

@Component({
  selector: 'app-databases',
  templateUrl: './databases.component.html',
  styleUrls: ['./databases.component.scss']
})
export class DatabasesComponent implements OnInit {
  listResourcesDescriptions;

  constructor(private internalService: InternalService) {
  }

  ngOnInit(): void {
    this.internalService.GetResearces({}).subscribe(data => {
      this.listResourcesDescriptions = data;
    }, (err) => {
    }, () => {
    });

    // window.addEventListener("scroll", event => {
    //   if (document.getElementById("second-nav-bar")) {
    //     if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
    //       document.getElementById("second-nav-bar").style['margin-top'] = '0px';
    //       document.getElementById("second-nav-bar").style['padding-top'] = '10px';
    //       // document.getElementById("logo_nav").style['margin'] = '0rem 0rem';

    //     } else {
    //       document.getElementById("second-nav-bar").style['margin-top'] = '75px';
    //       document.getElementById("second-nav-bar").style['padding-top'] = '0px';
    //       // document.getElementById("logo_nav").style['margin'] = '3rem 0rem';
    //     }
    //   }
    // });
  }

}
