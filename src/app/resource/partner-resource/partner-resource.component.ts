import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'partner-resource',
  templateUrl: './partner-resource.component.html',
  styleUrls: ['./partner-resource.component.scss']
})
export class PartnerResourceComponent implements OnInit {

  @Input() name;
  @Input() description;
  @Input() short_description;
  @Input() logo;
  @Input() resource_uri;
  @Input() resource_url;
  

  constructor() { }

  ngOnInit(): void {
  }

}
