import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 10000, noPause: true, showIndicators: false, isAnimated: true} }
  ]
})
export class HomeComponent implements OnInit {
  statObj = {
    count_biocurators: 0,
    resources: []
  };

  listResourcesDescriptions;
  searchFormControl = new FormControl();

  selected_resource;
  constructor(             private router: Router,
private internalService: InternalService) { }

  ngOnInit() {
    this.internalService.GetStat().subscribe((statData) => {
      this.statObj = statData;
    }, (err) => {
    }, () => {
    });

    // this.internalService.GetResearces({}).subscribe(data => {
    //   this.listResourcesDescriptions = data;
    // }, (err) => {
    // }, () => {
    //   this.selected_resource = 'disprot';
    // });
  }

  goTocuratorsPage() {

    this.router.navigate(['curators'], {queryParams: {curator_name: this.searchFormControl.value, from_homepage: 'true'}})
  }
}
