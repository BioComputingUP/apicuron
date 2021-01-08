import { Component, OnInit } from '@angular/core';
import {InternalService} from '../services/internal.service';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 10000, noPause: true, showIndicators: false, isAnimated: true} }
  ]
})
export class HomeComponent implements OnInit {
  listResourcesDescriptions;

  selected_resource;
  constructor(private internalService: InternalService) { }

  ngOnInit() {
    this.internalService.GetResearces().subscribe(data => {
      this.listResourcesDescriptions = data;
    }, (err) => {
    }, () => {
      this.selected_resource = 'disprot';
    });
  }

}
