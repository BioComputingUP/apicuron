import { Component, Input, OnInit } from '@angular/core';
import { RegistryEntry } from 'src/app/models/registryEntry.model';
import { Resource } from 'src/app/models/resource.model';

@Component({
  selector: 'app-registry-card',
  templateUrl: './registry-card.component.html',
})
export class RegistryCardComponent implements OnInit {
  showContributions: boolean = false;
  showGroups = [];
  @Input() entry: RegistryEntry;
  
  ngOnInit(): void {
    this.showGroups = new Array(this.getContributions().length).fill(false);
  }
  getContributions(){   
    return this.entry.contributed_to ?? [];
    
  }
  toggleGroups(index) {
    this.showGroups[index] = !this.showGroups[index];
  }
}
