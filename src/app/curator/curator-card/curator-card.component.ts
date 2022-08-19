import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'curator-card',
  templateUrl: './curator-card.component.html',
  styleUrls: ['./curator-card.component.scss']
})
export class CuratorCardComponent implements OnInit {
  
  constructor() { }

  vertical = true;

  ngOnInit(): void {
  }

}
