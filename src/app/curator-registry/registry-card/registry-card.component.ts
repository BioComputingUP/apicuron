import { Component, Input } from '@angular/core';
import { RegistryEntry } from 'src/app/models/registryEntry.model';

@Component({
  selector: 'app-registry-card',
  templateUrl: './registry-card.component.html',
})
export class RegistryCardComponent {
  @Input() entry: RegistryEntry;
  

  getContributionsNames(): string[]{
    return this.entry.contributed_to.map((resource: any) => resource.resource.resource_name);
    
  }
}
