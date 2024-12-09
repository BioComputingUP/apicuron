import { Component, Input, OnInit } from '@angular/core';
import { Resource } from 'src/app/models/resource.model';
@Component({
  selector: 'partner-resource',
  templateUrl: './partner-resource.component.html',
  styleUrls: ['./partner-resource.component.scss']
})
export class PartnerResourceComponent implements OnInit {

  @Input() resource: Resource;
  
  get description_formatted (){
    return this.resource.resource_description.slice(0, 315).concat('...')
  }

  constructor() {}

  ngOnInit(): void {
  }

}
