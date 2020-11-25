import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-badge-medal',
  templateUrl: './badge-medal.component.html',
  styleUrls: ['./badge-medal.component.scss']
})
export class BadgeMedalComponent implements OnInit {
  @Input() badge;
  @Input() color;

  constructor() { }

  ngOnInit(): void {
  }

}
