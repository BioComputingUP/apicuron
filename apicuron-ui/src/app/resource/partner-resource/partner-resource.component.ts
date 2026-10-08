import { Component, Input, OnInit } from '@angular/core';
import { Resource } from 'src/app/models/resource.model';
import { ResourceCategory } from 'src/app/models/types/enums';

// Pill colors of each resource category
const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  Database: 'tw-bg-green-100 tw-text-green-800 tw-border-green-300',
  KnowledgeBase: 'tw-bg-blue-100 tw-text-blue-800 tw-border-blue-300',
  Software: 'tw-bg-gray-100 tw-text-gray-800 tw-border-gray-300',
  Training: 'tw-bg-orange-100 tw-text-orange-800 tw-border-orange-300',
};
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

  get categoryColor() {
    return CATEGORY_COLORS[this.resource.category];
  }

  constructor() {}

  ngOnInit(): void {
  }

}
