import { Component, Input, OnInit } from '@angular/core';
import { Resource } from 'src/app/models/resource.model';
import { ResourceCategory } from 'src/app/models/types/enums';

// Color of the dot shown next to each resource category
const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  Database: 'tw-bg-green-500',
  KnowledgeBase: 'tw-bg-blue-500',
  Software: 'tw-bg-gray-800',
  Training: 'tw-bg-orange-500',
};
@Component({
  selector: 'partner-resource',
  templateUrl: './partner-resource.component.html',
  styleUrls: ['./partner-resource.component.scss']
})
export class PartnerResourceComponent implements OnInit {

  @Input() resource: Resource;
  
  // Many resources use their name as long name, no need to show it twice
  get hasDistinctLongName() {
    const { resource_name, resource_long_name } = this.resource;
    return !!resource_long_name && resource_long_name !== resource_name;
  }

  get categoryColor() {
    return CATEGORY_COLORS[this.resource.category];
  }

  constructor() {}

  ngOnInit(): void {
  }

}
