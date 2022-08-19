import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'index-numbers-banner',
  templateUrl: './numbers-banner.component.html',
  styleUrls: ['./numbers-banner.component.scss']
})
export class NumbersBannerComponent implements OnInit {
  
  numberElements = [
    {
      icon: 'assets/user.svg',
      count: 88,
      text: 'biocurators'
    },
    {
      icon: 'assets/database.svg',
      count: 3,
      text: 'partner resources'
    },
    {
      icon: 'assets/curation-events.svg',
      count: 43700,
      text: 'Curation Events'
    },
    {
      icon: 'assets/medal.svg',
      count: 133,
      text: 'Achievements'
    }
    
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
